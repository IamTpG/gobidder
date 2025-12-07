import React from "react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../hooks/useWatchlist";
import { useAuth } from "../contexts/AuthContext";
import ProductCard from "../components/common/ProductCard";
import Spinner from "../components/common/Spinner";
import { HeartIcon } from "../components/common/Icons";

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlist, isLoading, error, toggleWatchlist, isInWatchlist } =
    useWatchlist();

  const handleWatchlistToggle = async (productId) => {
    try {
      await toggleWatchlist(productId);
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleBidNow = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-slate-600 mb-6">
            Please sign in to view your favorite products
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="text-primary mb-4" />
          <p className="text-slate-600 font-medium">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <HeartIcon filled className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                My Favorites
              </h1>
              <p className="text-slate-600 mt-1">
                {watchlist.length}{" "}
                {watchlist.length === 1 ? "product" : "products"} in your
                watchlist
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {watchlist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Your watchlist is empty
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Start adding products to your favorites by clicking the heart icon
              on any product card
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchlist.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                images={product.images}
                current_price={product.current_price}
                start_price={product.start_price}
                buy_now_price={product.buy_now_price}
                current_bidder={product.current_bidder}
                bid_count={product.bid_count}
                created_at={product.created_at}
                end_time={product.end_time}
                status={product.status}
                onBid={() => handleBidNow(product.id)}
                onClick={() => handleProductClick(product.id)}
                isInWatchlist={isInWatchlist(product.id)}
                onWatchlistToggle={handleWatchlistToggle}
                className="animate-fadeIn"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
