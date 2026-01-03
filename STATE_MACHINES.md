# State Machines and Flows

## Auth lifecycle (`src/contexts/AuthContext.tsx`)
- **State**: `user`, `vendor`, derived `isAuthenticated`.
- **Events**: `login(email,password)`, `register(email,password,name,role)`, `logout()`, `registerVendor(storeName, description)`.
- **Guards**: `registerVendor` requires `user`; vendor dashboard/pages gate on `vendor.status === 'approved'` (see `VendorDashboard.tsx`), admin panel gates on `user.role === 'admin'`.
- **Transitions**:
  - `login` → set `user` from `users` mock; if vendor role, also set `vendor` from `vendors` mock.
  - `register` → push new `User` into mock array, set as current user.
  - `logout` → clear `user` and `vendor`.
  - `registerVendor` → create new `Vendor` with `status: 'pending'`, mutate `user.role` to `vendor`, set new vendor.
- **Side effects**: Mutates in-memory `users`/`vendors` mock arrays; no persistence.
- **UI impact**: Pending/approved vendor states branch `VendorRegister.tsx`; `VendorDashboard.tsx` blocks until approved; `AdminPanel.tsx` and `Account.tsx` render role-specific CTAs; homepage and search filter approved vendors only.
- **Dev logging**: `[auth:*]` logs on actions and state changes (DEV only).

Diagram:
```
[Unauthenticated]
   | login (found) / set user,vendor?
   v
[Authenticated:role=customer]
   | registerVendor / new vendor(pending), role->vendor
   v
[Authenticated:role=vendor,pending]
   | (admin approves in mocks)
   v
[Authenticated:role=vendor,approved]

Any state --logout--> [Unauthenticated]
Auth gates: admin views require role=admin; vendor dashboard requires vendor.status=approved.
```

## Cart state (`src/contexts/CartContext.tsx`)
- **State**: `items: CartItem[]` with derived selectors `getCartTotal`, `getCartCount`, `getItemsByVendor`.
- **Events**: `addToCart(product, quantity?)`, `removeFromCart(productId)`, `updateQuantity(productId, quantity)` (<=0 removes), `clearCart()`.
- **Guards/logic**: Add merges quantities when product already present.
- **Side effects**: None beyond in-memory state; used by `Checkout` and cart badge displays.
- **UI impact**: Empty cart check in `Checkout.tsx`; summaries on product cards/headers.
- **Dev logging**: `[cart:*]` action traces and `[cart:state]` on state changes (DEV only).

Diagram:
```
[Cart empty]
   | add(product) (new) -> push item
   v
[Cart has items]
   | add(existing) -> inc qty
   | updateQuantity(qty<=0) or remove -> delete line
   | updateQuantity(qty>0) -> mutate qty
   | clear -> []
   v
[Cart empty] (loops)
Selectors read totals/groups; checkout reads items, emptiness gate.
```

## Availability/price requests (`src/contexts/RequestContext.tsx`, Cart, VendorDashboard, Checkout)
- **State**: `requests[]` with snapshot items, `cartSignature`, `status` (`pending|quoted|accepted|declined|cancelled|unavailable`), optional `quotedTotal`.
- **Events**: Cart triggers `createRequest`; vendor dashboard uses `respondToRequest` (quote or unavailable); buyer can `acceptRequest`, `declineRequest`, or `cancelRequest`.
- **Guards/logic**: Checkout is blocked unless there is an `accepted` request matching the current cart signature; cart shows stale warning if items change after requesting.
- **UI impact**: Cart summary shows request status/actions; vendor dashboard "Requests" tab allows setting price or marking unavailable; checkout redirects back to cart until quote is accepted.
- **Dev logging**: `[request:*]` traces in DEV.

Diagram:
```
[No request]
   | createRequest (cart) -> pending
   v
[pending]
   | respondToRequest(quoted) -> quoted
   | respondToRequest(unavailable) -> unavailable (stop)
   | cancelRequest -> cancelled (stop)
   v
[quoted]
   | acceptRequest -> accepted (checkout allowed)
   | declineRequest -> declined (stop)
   v
[accepted] -> checkout
Stale cart signature forces new request.
```

## Checkout wizard (`src/pages/Checkout.tsx`)
- **State**: `step` (1 shipping → 2 payment → 3 review), `paymentMethod`, `shippingInfo`, `isProcessing`, `orderPlaced`.
- **Events**: Step buttons (`setStep`), payment radio select (`setPaymentMethod`), order submit (`handlePlaceOrder`).
- **Guards**: Redirect to cart-empty screen if `items` empty and no order placed; uses `useAuth` to show checkout but does not block unauthenticated.
- **Side effects**: `handlePlaceOrder` simulates async delay, clears cart, shows toast, toggles `orderPlaced` to show confirmation screen.
- **UI impact**: Each step renders dedicated form; completion shows success card with links.
- **Dev logging**: `[checkout:step]`, `[checkout:payment]`, `[checkout:placeOrder:*]` (DEV only).

Diagram:
```
[Gate] items empty? -> EmptyCart screen
           |
           v (items exist)
[Step 1: shipping] --Next--> [Step 2: payment] --Next--> [Step 3: review]
    ^                             |                         |
    |--Back-----------------------|--Back-------------------|
                                 | Confirm (async)
                                 v
                        [orderPlaced=true]
                             |
                             v
                       Success screen
```

## Toast reducer (`src/hooks/use-toast.ts`)
- **State**: `memoryState.toasts` array.
- **Actions**: `ADD_TOAST`, `UPDATE_TOAST`, `DISMISS_TOAST` (queues removal), `REMOVE_TOAST`.
- **Guards/logic**: Limits to `TOAST_LIMIT` (1); `DISMISS` without id dismisses all.
- **Side effects**: `DISMISS_TOAST` schedules removal via `setTimeout` (`TOAST_REMOVE_DELAY`); `toast()` attaches `onOpenChange` to auto-dismiss.
- **UI impact**: Controls toast provider rendering.
- **Dev logging**: `[toast:action]` and `[toast:state]` on dispatches (DEV only).

Diagram:
```
[Toasts []]
   | ADD_TOAST -> prepend (limit 1)
   v
[Toasts [open]]
   | UPDATE_TOAST -> mutate matching id
   | DISMISS -> mark open:false, enqueue remove
   v (timeout)
[Toasts filtered/[]]
   | REMOVE_TOAST (manual or timer)
   v
[Toasts []] (loop)
```

## Status enums and gatekeeping (`src/types/marketplace.ts`)
- **VendorStatus**: `pending|approved|rejected` → governs visibility in `Index.tsx`/`Search.tsx` (approved only) and gating in `VendorRegister.tsx`, `VendorDashboard.tsx`, `AdminPanel.tsx`.
- **OrderStatus**: `pending|processing|shipped|delivered|cancelled` → displayed in `Account.tsx` order list.
- **PayoutStatus**: `pending|approved|paid|rejected` → displayed in `AdminPanel.tsx` and `VendorDashboard.tsx`.
- **Persistence**: Values sourced from in-memory `src/data/mockData.ts`; no URL/storage persistence.

## Search filter view (`src/pages/Search.tsx`)
- **State**: `priceRange`, `selectedCategories`, `selectedRating`, `selectedVendors`, `sortBy`, `isFilterOpen`.
- **Events**: Toggle category/vendor checkboxes, slider change, rating set, sort select, sheet open/close, `clearFilters` reset.
- **Logic**: Filters `products` mock in `useMemo`; uses URL query `q` for text search.
- **UI impact**: Product grid contents and badge for active filters; mobile sheet toggle.

Diagram:
```
[Filters state]
   | onChange of price/category/rating/vendor/sort/query
   v
[Recompute filteredProducts]
   | if none -> Empty state
   | else -> Grid render
   | clearFilters -> reset defaults
Sheet toggle drives mobile filter visibility only.
```

# How to Observe Transitions
- Run dev server (`npm run dev`) and use browser console; logs are gated to `import.meta.env.DEV`.
- Look for prefixes: `[auth:*]`, `[cart:*]`, `[checkout:*]`, `[toast:*]`. Trigger flows via login/register, cart actions, checkout steps, and toast-producing actions (e.g., `VendorRegister` success/error, checkout completion).

# High-Risk Areas
- Shared status enums in `src/types/marketplace.ts` used across multiple pages—changing values will break vendor/order gating and status badges.
- Auth and vendor creation mutate in-memory mocks; no persistence or conflict handling if reused across sessions.
- Checkout order placement clears the cart after async delay; missing failure handling could leave cart inconsistent if later wired to APIs.
- Toast reducer uses global `memoryState` and timeouts; multiple renders or unmounted components still share this state.
