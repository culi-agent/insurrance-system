import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ProfilePage from '@/pages/auth/ProfilePage';
import CategoriesPage from '@/pages/products/CategoriesPage';
import ProductListPage from '@/pages/products/ProductListPage';
import ProductDetailPage from '@/pages/products/ProductDetailPage';
import SearchPage from '@/pages/products/SearchPage';
import MotorQuotePage from '@/pages/quotation/MotorQuotePage';
import TravelQuotePage from '@/pages/quotation/TravelQuotePage';
import HealthQuotePage from '@/pages/quotation/HealthQuotePage';
import PurchaseWizardPage from '@/pages/purchase/PurchaseWizardPage';
import PaymentResultPage from '@/pages/purchase/PaymentResultPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import PoliciesPage from '@/pages/dashboard/PoliciesPage';
import PolicyDetailPage from '@/pages/dashboard/PolicyDetailPage';
import AboutPage from '@/pages/static/AboutPage';
import ContactPage from '@/pages/static/ContactPage';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminCustomersPage from '@/pages/admin/AdminCustomersPage';
import AdminPoliciesPage from '@/pages/admin/AdminPoliciesPage';
import AdminClaimsPage from '@/pages/admin/AdminClaimsPage';
import ComparisonPage from '@/pages/products/ComparisonPage';
import ClaimSubmitPage from '@/pages/claims/ClaimSubmitPage';
import ClaimsListPage from '@/pages/claims/ClaimsListPage';
import ClaimDetailPage from '@/pages/claims/ClaimDetailPage';

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Main routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categorySlug" element={<ProductListPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/products/compare" element={<ComparisonPage />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Quotation routes */}
        <Route path="/bao-hiem-xe" element={<MotorQuotePage />} />
        <Route path="/quotation/motor" element={<MotorQuotePage />} />
        <Route path="/bao-hiem-du-lich" element={<TravelQuotePage />} />
        <Route path="/quotation/travel" element={<TravelQuotePage />} />
        <Route path="/bao-hiem-suc-khoe" element={<HealthQuotePage />} />
        <Route path="/quotation/health" element={<HealthQuotePage />} />

        {/* Purchase routes */}
        <Route path="/purchase" element={<PurchaseWizardPage />} />
        <Route path="/purchase/result" element={<PaymentResultPage />} />

        {/* Protected: Dashboard */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/policies"
          element={<ProtectedRoute><PoliciesPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/policies/:policyId"
          element={<ProtectedRoute><PolicyDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/claims"
          element={<ProtectedRoute><ClaimsListPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/claims/:claimId"
          element={<ProtectedRoute><ClaimDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/claims/submit"
          element={<ProtectedRoute><ClaimSubmitPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/customers" element={<AdminCustomersPage />} />
        <Route path="/admin/policies" element={<AdminPoliciesPage />} />
        <Route path="/admin/claims" element={<AdminClaimsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
