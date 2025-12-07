import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "../layouts/Layout";
import HomePage from "../pages/HomePage";
import AuthPage from "../pages/AuthPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import OtpVerificationPage from "../pages/OtpVerificationPage";

import ProductDetailsPage from "../pages/ProductDetailsPage";
import TransactionPage from "../pages/TransactionPage";
import ProfilePage from "../pages/ProfilePage";
import ProductsPage from "../pages/ProductsPage";
import CreateProductPage from "../pages/CreateProductPage";
import EditProductPage from "../pages/EditProductPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import AdminRoute from "../components/routes/AdminRoute";
import SellerRoute from "../components/routes/SellerRoute";
import PublicRoute from "../components/routes/PublicRoute";
import NotFoundPage from "../pages/NotFoundPage";
import BidSettingPage from "../pages/admin/BidSettingPage";
import SellerApprovalPage from "../pages/admin/SellerApprovalPage";
import ProductManagementPage from "../pages/admin/ProductManagementPage";
import AdminLayout from "../layouts/AdminLayout";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="transactions/:id" element={<TransactionPage />} />

        {/* Authentication Pages - Only accessible when not logged in */}
        <Route
          path="auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="verify-otp"
          element={
            <PublicRoute>
              <OtpVerificationPage />
            </PublicRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Only accessible when logged in */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/create"
          element={
            <SellerRoute>
              <CreateProductPage />
            </SellerRoute>
          }
        />
        <Route
          path="products/:id/edit"
          element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="bid-settings" element={<BidSettingPage />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="seller-approval" element={<SellerApprovalPage />} />
        </Route>

        {/* 404 - Page Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
