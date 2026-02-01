import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingState } from "@/components/LoadingState";
import { AppAnalytics } from "@/components/AppAnalytics";
import { AppSpeedInsights } from "@/components/AppSpeedInsights";
import Index from "./pages/Index";
import Search from "./pages/Search";

const Category = React.lazy(() => import("./pages/Category"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Login = React.lazy(() => import("./pages/Login"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const RefundPolicy = React.lazy(() => import("./pages/RefundPolicy"));
const Menu = React.lazy(() => import("./pages/Menu"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const SetupAdmin = React.lazy(() => import("./pages/SetupAdmin"));
const NotAuthorized = React.lazy(() => import("./pages/NotAuthorized"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense
              fallback={(
                <div className="container py-12">
                  <LoadingState title="جاري التحميل" message="برجاء الانتظار..." />
                </div>
              )}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/category/:name" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={(
                    <ProtectedRoute requireRole="admin">
                      <AdminPanel />
                    </ProtectedRoute>
                  )}
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/setup-admin" element={<SetupAdmin />} />
                <Route path="/not-authorized" element={<NotAuthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <AppAnalytics />
            <AppSpeedInsights />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
