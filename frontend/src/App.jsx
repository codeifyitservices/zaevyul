import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CustomerAuthProvider } from "./context/CustomerAuthContext"; // CUSTOMER — new
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import AdminRouter from "./router";
import LandingPage from "./landing/pages/LandingPage";
import CollectionsPage from "./landing/pages/CollectionsPage";
import ProductDetailPage from "./landing/pages/ProductDetailPage";
import CartPage from "./landing/pages/CartPage";
import MyAccountPage from "./landing/pages/MyAccountPage";
import JournalPage from "./landing/pages/JournalPage";
import JournalDetailPage from "./landing/pages/JournalDetailPage";
import CustomerLoginPage from "./landing/pages/CustomerLoginPage";
import OurStoryPage from "./landing/pages/OurStory";
import ScrollToTop from "./landing/components/ScrollToTop";
import CartDrawer from "./landing/components/CartDrawer";
import WishlistDrawer from "./landing/components/WishlistDrawer";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  return (
    <BrowserRouter>
      <CurrencyProvider>
        <ThemeProvider>
          <ToastProvider>
            {/* Customer auth wraps the storefront — Google provider needed for GoogleLogin component */}
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <CustomerAuthProvider>
                <FavoritesProvider>
                  <CartProvider>
                    <ScrollToTop />
                    <CartDrawer />
                    <WishlistDrawer />
                    <Routes>
                      {/* Storefront routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route
                        path="/collections"
                        element={<CollectionsPage />}
                      />
                      <Route
                        path="/collections/:category"
                        element={<CollectionsPage />}
                      />
                      <Route
                        path="/collection/:categorySlug/:productSlug"
                        element={<ProductDetailPage />}
                      />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/my-account/*" element={<MyAccountPage />} />
                      <Route path="/journal" element={<JournalPage />} />
                      <Route
                        path="/journal/:slug"
                        element={<JournalDetailPage />}
                      />
                      <Route path="/about" element={<OurStoryPage />} />

                      {/* Customer auth */}
                      <Route path="/login" element={<CustomerLoginPage />} />

                      {/* Admin panel — separate auth context */}
                      <Route path="/admin/*" element={<AdminRouter />} />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </CartProvider>
                </FavoritesProvider>
              </CustomerAuthProvider>
            </GoogleOAuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </CurrencyProvider>
    </BrowserRouter>
  );
}
