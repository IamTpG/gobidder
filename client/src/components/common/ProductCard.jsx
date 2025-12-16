import React from "react";
import { useState, useEffect } from "react";

import api from "../../services/api";
import Countdown from "./Countdown";
import { HeartIcon } from "./Icons";

export const ProductCard = ({
  id,
  images,
  name,
  current_price,
  start_price,
  buy_now_price,
  current_bidder,
  bid_count = 0,
  created_at,
  end_time,
  status = "Active",
  onBid,
  onClick,
  className = "",
  isInWatchlist = false,
  onWatchlistToggle,
  // Destructure other props to prevent passing non-DOM attributes
  seller,
  category,
  seller_id,
  category_id,
  current_bidder_id,
  auto_renew,
  step_price,
  ...props // Only pass valid DOM attributes
}) => {
  // Get first image from array or use placeholder
  const getImageUrl = () => {
    if (!images) return "https://via.placeholder.com/400x300?text=No+Image";
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : images;
      } catch {
        return images;
      }
    }
    if (Array.isArray(images) && images.length > 0) return images[0];
    return "https://via.placeholder.com/400x300?text=No+Image";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format price for Float with 2 decimal places (USD format)
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00";

    // Convert string to number if needed (for backward compatibility)
    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    // Validate number
    if (isNaN(numPrice)) return "0.00";

    // Format with exactly 2 decimal places and thousands separator
    return numPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Button styles based on status from DB
  const getButtonStyles = () => {
    if (props.isOwner) {
      if (status === "Sold" || status === "Expired" || status === "Removed") {
        return "hidden";
      }
      return "bg-[#01AA85] text-white hover:bg-[#018f70] hover:shadow-lg transition-all duration-300";
    }
    if (props.isOwner) {
      if (status === "Sold" || status === "Expired" || status === "Removed") {
        return "hidden";
      }
      return "bg-[#01AA85] text-white hover:bg-[#018f70] hover:shadow-lg transition-all duration-300";
    }
    if (status === "Sold" || status === "Expired" || status === "Removed") {
      return "bg-slate-300 text-slate-500 cursor-not-allowed";
    }
    if (status === "Pending") {
      return "bg-yellow-500 text-white cursor-not-allowed";
    }
    return "bg-slate-900 text-white hover:bg-primary hover:shadow-lg transition-all duration-300";
  };

  const getButtonText = () => {
    if (props.isOwner) {
      return "Edit";
    }
    if (props.isOwner) {
      return "Edit";
    }
    switch (status) {
      case "Sold":
        return "Sold";
      case "Expired":
        return "Auction Ended";
      case "Removed":
        return "Removed";
      case "Pending":
        return "Pending Approval";
      default:
        return "Bid Now";
    }
  };

  const [highlightDuration, setHighlightDuration] = useState(null);

  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const response = await api.get("/admin/system-config");

        // Axios trả về data trực tiếp trong response.data
        const data = response.data;

        if (data && data.new_product_duration) {
          setHighlightDuration(data.new_product_duration);
        }
      } catch (error) {
        console.error("Error fetching configuration", error);
      }
    };
    fetchSystemConfig();
  }, []);

  const isNewProduct = () => {
    if (!created_at || highlightDuration === null) return false;
    const postedTime = new Date(created_at).getTime();
    const hightLightTime = highlightDuration * 60 * 1000;
    return Date.now() - postedTime < hightLightTime;
  };

  const isNew = isNewProduct();

  return (
    <div
      className={` bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group 
      ${onClick ? "cursor-pointer" : ""} 
      ${className}
      ${isNew ? "border-2 border-amber-500 ring-4 ring-amber-300/50 shadow-lg" : ""}`}
      onClick={(e) => {
        // Chỉ navigate nếu click không phải vào button hoặc icon khác
        if (onClick && e.target.closest("button") === null) {
          onClick(e);
        }
      }}
    >
      {/* Image Container */}
      <div className="relative h-64 bg-slate-100">
        {/* New Badge */}
        {isNew && (
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md ">
              New Product
            </span>
          </div>
        )}

        <img
          src={getImageUrl()}
          alt={name || "Product"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Countdown Timer - Bottom overlay */}
        {end_time && (
          <Countdown
            endTime={end_time}
            variant="overlay"
            showLabels={true}
            className="absolute left-0 right-0 bottom-0"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 mb-3 line-clamp-2 min-h-[3rem] leading-snug">
          {name}
        </h3>

        {/* Current Bidder & Bid Count */}
        <div className="flex items-center justify-between mb-3 text-xs">
          {current_bidder ? (
            <div className="flex items-center gap-1 text-slate-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium">{current_bidder.full_name}</span>
            </div>
          ) : (
            <div className="text-slate-400 italic">No bids yet</div>
          )}

          <div className="flex items-center gap-1 text-slate-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <span className="font-medium">
              {bid_count} {bid_count === 1 ? "bid" : "bids"}
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-3">
          <p className="text-xs text-slate-600 font-medium mb-1">
            {current_price && current_price !== start_price
              ? "Current bid:"
              : "Starting bid:"}
          </p>
          <div className="text-2xl font-bold text-slate-900">
            ${formatPrice(current_price || start_price)}
          </div>
        </div>

        {/* Buy Now Price */}
        {buy_now_price && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700 font-medium">
                Buy Now:
              </span>
              <span className="text-sm font-bold text-green-700">
                ${formatPrice(buy_now_price)}
              </span>
            </div>
          </div>
        )}

        {/* Posted Date */}
        {created_at && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Posted: {formatDate(created_at)}</span>
            </div>

            {/* Watchlist Heart Icon */}
            {onWatchlistToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWatchlistToggle(id);
                }}
                className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                  isInWatchlist
                    ? "text-red-500 hover:bg-red-50"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
                title={
                  isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
                }
              >
                <HeartIcon filled={isInWatchlist} className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Bid Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Nếu là chủ sản phẩm, cho edit; còn không thì navigate đến chi tiết sản phẩm
            if (props.isOwner && props.onEdit) {
              props.onEdit();
            } else if (onClick) {
              // Navigate đến trang chi tiết sản phẩm
              onClick(e);
            } else if (onBid) {
              onBid();
            }
          }}
          disabled={
            !props.isOwner &&
            (status === "Sold" ||
              status === "Expired" ||
              status === "Removed" ||
              status === "Pending")
          }
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${getButtonStyles()}`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
