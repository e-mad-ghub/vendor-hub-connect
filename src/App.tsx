import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { RequestProvider } from "@/contexts/RequestContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import VendorStore from "./pages/VendorStore";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Account from "./pages/Account";
import VendorRegister from "./pages/VendorRegister";
import VendorDashboard from "./pages/VendorDashboard";
import AdminPanel from "./pages/AdminPanel";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import VendorPolicy from "./pages/VendorPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import RequestStatus from "./pages/RequestStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <RequestProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/category/:name" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/vendor/:id" element={<VendorStore />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/account" element={<Account />} />
                <Route path="/vendor/register" element={<VendorRegister />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/vendor-policy" element={<VendorPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/requests" element={<RequestStatus />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RequestProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
