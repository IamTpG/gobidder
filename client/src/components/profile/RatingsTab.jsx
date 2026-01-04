import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../common/Spinner";
import RatingDisplay from "./RatingDisplay";

const RatingsTab = ({ profile, userId, standalone = false }) => {
  const [ratings, setRatings] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      setError(null);
      try {
        if (userId) {
          // Fetch ratings của user cụ thể
          const { data } = await api.get(`/users/${userId}/ratings`);
          setUserData(data.user);
          setRatings(data.ratings);
        } else {
          // Fetch ratings của user hiện tại
          const { data } = await api.get("/users/me/ratings");
          setRatings(data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load ratings");
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [userId]);

  const getRatingBadge = (score) => {
    if (score === "Positive") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          ✓ Positive
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          ✗ Negative
        </span>
      );
    }
  };

  // Xác định rating summary và title
  const ratingSummary = userId ? userData?.rating : profile?.rating;
  const title = userId ? `Ratings for ${userData?.fullName || ""}` : "Ratings";
  const description = userId
    ? "View all ratings and comments received by this user."
    : "View all ratings and comments you have received.";
  const emptyMessage = userId
    ? "This user hasn't received any ratings from other users."
    : "You haven't received any ratings from other users.";

  // Loading state
  const loadingContent = (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[500px] flex items-center justify-center">
      <Spinner />
    </div>
  );

  // Error state
  const errorContent = (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[500px]">
      <div className="text-center text-red-500">{error}</div>
      {standalone && (
        <div className="text-center mt-4">
          <Link to="/products" className="text-primary hover:underline">
            Back to Products
          </Link>
        </div>
      )}
    </div>
  );

  // Main content
  const mainContent = (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[500px]">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {ratingSummary && (
          <div className="md:w-80 flex-shrink-0">
            <RatingDisplay rating={ratingSummary} small />
          </div>
        )}
      </div>

      {ratings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No ratings yet</p>
          <p className="text-gray-400 text-sm mt-2">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {rating.rater.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {rating.rater.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getRatingBadge(rating.score)}
                  <span className="text-sm text-gray-400">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {rating.comment && (
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {rating.comment}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  {rating.transaction.product.images[0] && (
                    <img
                      src={rating.transaction.product.images[0]}
                      alt={rating.transaction.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Product:</p>
                    <Link
                      to={`/products/${rating.transaction.product.id}`}
                      className="text-[#00B289] hover:underline font-medium"
                    >
                      {rating.transaction.product.name}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Nếu standalone, wrap với full page layout
  if (standalone) {
    if (loading) {
      return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-500">{error}</p>
            <Link
              to="/products"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Back to Products
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {mainContent}
        </div>
      </div>
    );
  }

  // Nếu không standalone, chỉ render content
  if (loading) return loadingContent;
  if (error) return errorContent;
  return mainContent;
};

export default RatingsTab;
