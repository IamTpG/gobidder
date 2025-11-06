import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Home from '../pages/Home';
import Auth from '../pages/Auth';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home Page */}
        <Route index element={<Home />} />
        
        {/* Authentication Pages */}
        <Route path="auth" element={<Auth />} />
        <Route path="login" element={<Auth />} />
        <Route path="register" element={<Auth />} />
        
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
