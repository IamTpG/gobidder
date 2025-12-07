import React from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../common/ProductCard";
import { useWatchlist } from "../../hooks/useWatchlist";
import { useAuth } from "../../contexts/AuthContext";

const ProductGrid = ({ products }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const handleWatchlistToggle = async (productId) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await toggleWatchlist(productId);
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
      {products.map((p) => {
        return (
          <ProductCard
            key={p.id}
            {...p}
            onClick={() => navigate(`/products/${p.id}`)}
            onBid={() => console.log("Bid on:", p.name || p.title)}
            isInWatchlist={user ? isInWatchlist(p.id) : false}
            onWatchlistToggle={handleWatchlistToggle}
          />
        );
      })}
    </div>
  );
};

export default ProductGrid;
