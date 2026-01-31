# Security & Data Access Model

## Client-accessible data
- The frontend directly reads the `user_roles` table to determine whether the current user is an admin.
- No other database tables are queried directly by the browser in this codebase.
- Product, quote-request, and WhatsApp settings data are stored in `localStorage` and are not persisted server-side.

## Supabase Row Level Security (RLS)
- `public.user_roles` has RLS enabled.
- Policies ensure:
  - Users can read their own roles.
  - Admins can read and manage all roles via `public.has_role`.

## Admin creation
- Admin creation happens only through the `setup-admin` Edge Function.
- The function uses a server-side service role key (never exposed to the client) to create the first admin user and write to `user_roles`.
- The function expects `ADMIN_SETUP_KEY` to be set in Supabase Function environment variables.

## Secret handling
- Client-side environment variables must be prefixed with `VITE_` and use Supabase **anon** keys only.
- Service role keys must never be included in the frontend bundle or committed to the repository.

## Recommended baseline checks
- Confirm RLS is enabled for any new tables before exposing them to the client.
- Add explicit policies for tenant/vendor scoping and admin-only actions as new tables are introduced.
