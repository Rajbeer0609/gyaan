import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { UIProvider } from './context/UIContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/Home';
import { ShopPage } from './pages/Shop';
import { ProductPage } from './pages/Product';
import { CartPage } from './pages/Cart';
import { CheckoutPage } from './pages/Checkout';
import { OrderConfirmationPage } from './pages/OrderConfirmation';
import { WishlistPage } from './pages/Wishlist';

// Auth Pages
import { LoginPage } from './pages/Auth/Login';
import { RegisterPage } from './pages/Auth/Register';
import { ForgotPasswordPage } from './pages/Auth/ForgotPassword';
import { ResetPasswordPage } from './pages/Auth/ResetPassword';

// Account Page
import { AccountPage } from './pages/Account';

// Static & Policy Pages
import { AboutPage } from './pages/Static/About';
import { ContactPage } from './pages/Static/Contact';
import { FAQPage } from './pages/Static/FAQ';
import { PoliciesPage } from './pages/Static/Policies';

// Admin Pages
import { AdminDashboardPage } from './pages/Admin/Dashboard';
import { AdminProductsPage } from './pages/Admin/Products';
import { AdminCategoriesPage } from './pages/Admin/Categories';
import { AdminOrdersPage } from './pages/Admin/Orders';
import { AdminCouponsPage } from './pages/Admin/Coupons';
import { AdminCustomersPage } from './pages/Admin/Customers';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <UIProvider>
              <Routes>
                {/* Storefront Customer Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/products/:slug" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />

                  {/* Auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Account */}
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/orders" element={<AccountPage />} />

                  {/* Editorial & Information */}
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/policies/:type" element={<PoliciesPage />} />
                </Route>

                {/* Protected Administrative Suite */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </UIProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
