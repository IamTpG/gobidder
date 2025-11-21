import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../common/Spinner";
import NotFound from "../../pages/NotFound";

const PublicRoute = ({ children }) => {
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

  if (user) {
    return <NotFound />;
  }

  return children;
};

export default PublicRoute;
