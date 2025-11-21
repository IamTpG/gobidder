import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import NotFound from "../../pages/NotFound";
import Spinner from "../common/Spinner";

const ProtectedRoute = ({ children }) => {
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
    return <NotFound />;
  }

  return children;
};

export default ProtectedRoute;
