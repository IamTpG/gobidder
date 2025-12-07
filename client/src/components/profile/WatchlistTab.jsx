import React from "react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../hooks/useWatchlist";
import ProductCard from "../common/ProductCard";
import Spinner from "../common/Spinner";
import { HeartIcon } from "../common/Icons";

const WatchlistTab = () => {
  const navigate = useNavigate();
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <div className="text-center">
          <Spinner size="lg" className="text-primary mb-4" />
          <p className="text-slate-600 font-medium">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <div className="text-center">
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
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <HeartIcon filled className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Watchlist</h2>
          <p className="text-slate-600 text-sm mt-1">
            {watchlist.length}{" "}
            {watchlist.length === 1 ? "product" : "products"} in your favorites
          </p>
        </div>
      </div>

      {/* Content */}
      {watchlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            Your watchlist is empty
          </h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Start adding products to your favorites by clicking the heart icon on
            any product card
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};

export default WatchlistTab;
