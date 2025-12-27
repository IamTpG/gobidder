import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import LoadingState from "../components/profile/LoadingState";
import ErrorState from "../components/profile/ErrorState";
import MyInfoTab from "../components/profile/MyInfoTab";
import MyBidsTab from "../components/profile/MyBidsTab";
import MyProductsTab from "../components/profile/MyProductsTab";
import WatchlistTab from "../components/profile/WatchlistTab";
import RatingsTab from "../components/profile/RatingsTab";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [searchParams] = useSearchParams();
  const activeNavKey = searchParams.get("tab") || "information";
  const { logout } = useAuth();
  const navigate = useNavigate();

  // --- Fetch Profile Logic ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/users/me");
        setProfile(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Cannot load user information.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- Global Handlers ---
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      // In a real app, you might want to show a toast here
      console.error("Logout failed", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // --- Render Tab Content ---
  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={handleRetry} />;
    if (!profile) return null;

    switch (activeNavKey) {
      case "information":
        return (
          <MyInfoTab
            profile={profile}
            setProfile={setProfile}
            onLogout={handleLogout}
            isLoggingOut={loggingOut}
          />
        );
      case "bids":
        return <MyBidsTab />;
      case "my-products":
        return <MyProductsTab />;
      case "watchlist":
        return <WatchlistTab />;
      case "ratings":
        return <RatingsTab profile={profile} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar activeKey={activeNavKey} userRole={profile?.role} />
          <section className="flex-1">{renderContent()}</section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
