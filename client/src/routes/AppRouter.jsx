import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../layouts/Layout";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import OtpVerification from "../pages/OtpVerification";
import ProfilePage from "../pages/ProfilePage";
import ForgotPassword from "../pages/ForgotPassword";
import NotFound from "../pages/NotFound";
import ProductsPage from "../pages/ProductsPage";
import CreateProductPage from "../pages/CreateProductPage";
import EditProductPage from "../pages/EditProductPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import PublicRoute from "../components/routes/PublicRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home Page */}
        <Route index element={<Home />} />
        {/* Products Page */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="products/:id/edit" element={<EditProductPage />} />

        {/* Authentication Pages - Only accessible when not logged in */}
        <Route
          path="auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="login"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="verify-otp"
          element={
            <PublicRoute>
              <OtpVerification />
            </PublicRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Product Details - unified route */}
        <Route path="products/:id" element={<ProductDetailsPage />} />

        {/* TODO: Add more routes as needed */}
        {/* <Route path="auctions" element={<Auctions />} /> */}
        {/* <Route path="auctions/:id" element={<AuctionDetails />} /> */}
        {/* <Route path="profile" element={<Profile />} /> */}
        {/* <Route path="dashboard" element={<Dashboard />} /> */}

        {/* Protected Routes - Only accessible when logged in */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 - Page Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
