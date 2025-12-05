import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../common/Spinner";

/**
 * Route guard for active Sellers only
 * Blocks ExpiredSeller from accessing seller-only features like product creation
 */
const SellerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Only allow active Seller role (not ExpiredSeller)
  if (user.role !== "Seller") {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default SellerRoute;
