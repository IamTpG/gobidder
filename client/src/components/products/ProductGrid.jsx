import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuctionCard } from "../common";

// Utility function để transform product data
const transformProductForCard = (product, navigate) => {
  // Xử lý images - support cả string, array, hoặc JSON string
  let images = product.images;
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      images = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      images = [images];
    }
  }
  if (!Array.isArray(images)) {
    images = images ? [images] : [];
  }

  // Xử lý current_bidder - support nhiều format
  const currentBidder =
    product.current_bidder ||
    (product.seller
      ? {
          full_name:
            typeof product.seller === "string"
              ? product.seller
              : product.seller?.full_name,
        }
      : null);

  // Ensure prices là string (AuctionCard expects string từ BigInt)
  const currentPrice =
    product.current_price?.toString() || product.current_price || "0";
  const startPrice =
    product.start_price?.toString() ||
    product.starting_price?.toString() ||
    currentPrice;

  return {
    id: product.id,
    images,
    name: product.name || product.title || "Untitled Product",
    current_price: currentPrice,
    start_price: startPrice,
    buy_now_price: product.buy_now_price?.toString(),
    current_bidder: currentBidder,
    bid_count: product.bid_count || 0,
    created_at: product.created_at,
    end_time: product.end_time,
    status: product.status || "Active",
    onBid: (e) => {
      e?.stopPropagation();
      // TODO: Implement bid logic
      console.log("Bid on product:", product.id);
    },
    onClick: () => navigate(`/product/${product.id}`),
  };
};

const ProductGrid = ({ products }) => {
  const navigate = useNavigate();

  // Memoize transformed products để tránh re-transform không cần thiết
  const transformedProducts = useMemo(
    () => products.map((product) => transformProductForCard(product, navigate)),
    [products, navigate],
  );

  if (transformedProducts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
      {transformedProducts.map((cardProps) => {
        return <AuctionCard key={cardProps.id} {...cardProps} />;
      })}
    </div>
  );
};

export default ProductGrid;
