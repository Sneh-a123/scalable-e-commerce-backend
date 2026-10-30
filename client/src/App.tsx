import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AiCopilotModal } from './components/customer/AiCopilotModal';
import { GithubShowcaseModal } from './components/customer/GithubShowcaseModal';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CategoriesPage } from './pages/customer/CategoriesPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';

// Admin Layout & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-dark-navy text-white">
      {/* Show Customer Navbar on non-admin routes */}
      {!isAdminRoute && (
        <Navbar
          onOpenAiCopilot={() => setAiModalOpen(true)}
          onOpenGithub={() => setGithubModalOpen(true)}
        />
      )}

      {/* Main Routes */}
      <div className="flex-1">
        <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<HomePage onOpenAiCopilot={() => setAiModalOpen(true)} />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<LoginPage />} />

          {/* Admin Management Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/create" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </div>

      {/* Show Customer Footer on non-admin routes */}
      {!isAdminRoute && <Footer />}

      {/* Global AI Copilot Modal */}
      <AiCopilotModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />

      {/* Global GitHub Showcase Modal */}
      <GithubShowcaseModal isOpen={githubModalOpen} onClose={() => setGithubModalOpen(false)} />
    </div>
  );
};
