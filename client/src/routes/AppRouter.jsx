import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../layouts/Layout";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import OtpVerification from "../pages/OtpVerification";
// import SetupAccount from '../pages/setupAccount';
import ProductsPage from "../pages/ProductsPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home Page */}
        <Route index element={<Home />} />
        {/* Products Page */}
        <Route path="products" element={<ProductsPage />} />
        {/* Authentication Pages */}
        <Route path="auth" element={<Auth />} />
        <Route path="login" element={<Auth />} />
        <Route path="register" element={<Auth />} />

        {/* Product Details - unified route */}
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="verify-otp" element={<OtpVerification />} />

        {/* TODO: Add more routes as needed */}
        {/* <Route path="auctions" element={<Auctions />} /> */}
        {/* <Route path="auctions/:id" element={<AuctionDetails />} /> */}
        {/* <Route path="profile" element={<Profile />} /> */}
        {/* <Route path="dashboard" element={<Dashboard />} /> */}

        {/* 404 - Page Not Found */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRouter;
