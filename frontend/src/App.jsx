import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import AdminRouter from './router';
import LandingPage from './landing/LandingPage';
import CollectionsPage from './landing/CollectionsPage';
import ProductDetailPage from './landing/ProductDetailPage';
import CartPage from './landing/CartPage';
import MyAccountPage from './landing/MyAccountPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/collections/:category" element={<CollectionsPage />} />
                <Route path="/collection/:categorySlug/:productSlug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/my-account" element={<MyAccountPage />} />
                <Route path="/admin/*" element={<AdminRouter />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
