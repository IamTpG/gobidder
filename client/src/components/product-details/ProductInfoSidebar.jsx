import React from "react";

import BidControls from "./BidControls";
import {
  formatPrice,
  formatDateTime,
  maskUserName,
  calculateRating,
} from "../../utils/formatters";
import Badge from "../common/Badge";
import CountdownTimer from "../common/CountdownTimer";
import Button from "../common/Button";
import { HeartIcon } from "../common/Icons";
import ConfirmDialog from "../common/ConfirmDialog";

const ProductInfoSidebar = ({
  product,
  user,
  bidAmount,
  isBidding,
  bidError,
  bidSuccessMsg,
  myAutoBidPrice,
  onBidChange,
  onPlaceBid,
  onNavigateToAuth,
  onFinishPayment,
  isBanned,
  isCheckingBan,
  isInWatchlist = false,
  onWatchlistToggle,
}) => {
  // Tính số ngày còn lại đến khi kết thúc đấu giá
  const getDaysUntilEnd = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // Logic kiểm tra vai trò
  const isSeller = user && product.seller && user.id === product.seller.id;
  const isWinner =
    user && product.currentBidder && user.id === product.currentBidder.id;
  const isAuctionEnded = new Date() > new Date(product.auctionEndDate);

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showBuyNowConfirm, setShowBuyNowConfirm] = React.useState(false);
  const [isBuying, setIsBuying] = React.useState(false);

  // Helper render User Card (Seller/Bidder)
  const UserInfoCard = ({ title, data, isHighlight = false }) => (
    <div
      className={`rounded-xl px-4 py-3 border transition-all duration-300 ${
        isHighlight
          ? "bg-primary/5 border-primary shadow-sm"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${isHighlight ? "text-primary" : "text-gray-500"}`}
        >
          {title}
        </p>
        <Badge variant={isHighlight ? "success" : "lightPrimary"} size="xs">
          Rating: {calculateRating(data.ratingPlus || 0, data.ratingMinus || 0)}
        </Badge>
      </div>
      <p
        className={`text-sm font-bold ${isHighlight ? "text-primary-dark" : "text-gray-900"}`}
      >
        {isHighlight ? "You (Current Leader)" : data.name}
      </p>
    </div>
  );

  const handleConfirmBid = () => {
    setShowConfirm(false);
    onPlaceBid();
  };

  const handleConfirmBuyNow = async () => {
    try {
      setIsBuying(true);
      const { buyNow } = require("../../services/api");
      await buyNow(product.id);

      if (onFinishPayment) {
        await onFinishPayment();
      }
    } catch (error) {
      console.error("Buy Now failed", error);
    } finally {
      setIsBuying(false);
      setShowBuyNowConfirm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Price */}
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
          {product.name}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Bid</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(product.currentBid)}
            </p>
          </div>
          {product.buyNowPrice && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Buy Now</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(product.buyNowPrice)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Meta Info (Date, Seller, Winner) */}
      <div className="space-y-2">
        {product.seller && (
          <UserInfoCard title="Seller" data={product.seller} />
        )}
        {product.currentBidder && (
          <UserInfoCard
            title={isWinner ? "You are winning!" : "Current Highest Bidder"}
            data={{
              ...product.currentBidder,
              name: maskUserName(product.currentBidder.name),
            }}
            isHighlight={true}
          />
        )}
        {myAutoBidPrice > 0 && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-dashed border-gray-300">
            <span className="text-xs text-gray-500">Your Auto-bid limit: </span>
            <span className="font-semibold text-gray-900">
              {formatPrice(myAutoBidPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Start date */}
      <div className="py-0">
        <p className="text-xs font-medium text-gray-500 mb-1">Posted on:</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-sm font-semibold text-gray-900">
            {formatDateTime(product.createdAt)}
          </p>
        </div>
      </div>

      {/* Timer & Controls */}
      {!isAuctionEnded ? (
        <>
          <div className="py-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Time Left:</p>
            {getDaysUntilEnd(product.auctionEndDate) < 3 ? (
              <CountdownTimer
                endDate={product.auctionEndDate}
                timezone={product.timezone}
                variant="compact"
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-sm font-semibold text-primary">
                  {formatDateTime(product.auctionEndDate)}
                </p>
              </div>
            )}
          </div>

          {/* Watchlist Button */}
          {user && onWatchlistToggle && (
            <button
              onClick={() => onWatchlistToggle(product.id)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${
                isInWatchlist
                  ? "bg-red-50 border-red-500 text-red-600 hover:bg-red-100"
                  : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5"
              }`}
            >
              <HeartIcon filled={isInWatchlist} className="w-5 h-5" />
              <span>
                {isInWatchlist ? "Remove from Favorites" : "Add to Favorites"}
              </span>
            </button>
          )}

          {!isSeller ? (
            <div className="space-y-3">
              {isBanned && (
                <div className="p-4 text-sm text-red-800 bg-red-50 border border-red-300 rounded-lg font-medium">
                  You have been banned from bidding on this product by the
                  seller.
                </div>
              )}
              {bidError && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {bidError}
                </div>
              )}
              {bidSuccessMsg && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                  {bidSuccessMsg}
                </div>
              )}

              {/* Check if user is unrated and product doesn't allow unrated bidders */}
              {(() => {
                if (!user) {
                  return null; // User not logged in
                }

                // Check if user rating data is loaded.
                // Check if user rating data is loaded.
                // Backend reverted to snake_case (rating_plus), so we need to handle that.
                const userRatingPlus =
                  user?.rating_plus ?? user?.ratingPlus ?? 0;
                const userRatingMinus =
                  user?.rating_minus ?? user?.ratingMinus ?? 0;

                const totalRatings = userRatingPlus + userRatingMinus;
                const ratingPercentage =
                  totalRatings > 0
                    ? (userRatingPlus / totalRatings) * 100
                    : 100;
                const isUnratedUser = totalRatings === 0;
                const productDisallowsUnrated =
                  product.allowUnratedBidders === false;
                const shouldBlockUnrated =
                  isUnratedUser && productDisallowsUnrated;

                // Check if user has low rating (below 80%)
                const isLowRatingUser =
                  totalRatings > 0 && ratingPercentage < 80;
                const productDisallowsLowRating =
                  product.allowLowRatingBidders === false;
                const shouldBlockLowRating =
                  isLowRatingUser && productDisallowsLowRating;

                // DEBUG LOG
                console.log("🔍 RATING CHECK:", {
                  user: {
                    ratingPlus: userRatingPlus,
                    ratingMinus: userRatingMinus,
                    original: user,
                  },
                  product: {
                    allowUnratedBidders: product.allowUnratedBidders,
                    allowLowRatingBidders: product.allowLowRatingBidders,
                  },
                  calculated: {
                    totalRatings,
                    ratingPercentage: ratingPercentage.toFixed(2) + "%",
                    isUnratedUser,
                    isLowRatingUser,
                    shouldBlockUnrated,
                    shouldBlockLowRating,
                  },
                });

                // Show warning for unrated users
                if (shouldBlockUnrated) {
                  return (
                    <div className="p-4 text-sm text-amber-800 bg-amber-50 border border-amber-300 rounded-lg font-medium">
                      This seller doesn't allow bidders with no ratings. Please
                      complete some transactions to earn ratings before bidding
                      on this product.
                    </div>
                  );
                }

                // Show warning for low-rated users
                if (shouldBlockLowRating) {
                  return (
                    <div className="p-4 text-sm text-amber-800 bg-amber-50 border border-amber-300 rounded-lg font-medium">
                      This seller doesn't allow bidders with rating below 80%.
                      Your current rating is {ratingPercentage.toFixed(0)}%.
                      Please improve your rating to bid on this product.
                    </div>
                  );
                }

                // Only show bid controls if not banned, not unrated-blocked, and not low-rating-blocked
                if (!isBanned) {
                  return (
                    <>
                      <div className="space-y-3">
                        <BidControls
                          currentBid={Number(product.currentBid)}
                          startPrice={Number(product.startPrice)}
                          bidAmount={bidAmount}
                          onBidChange={onBidChange}
                          onBid={() => setShowConfirm(true)}
                          minBidIncrement={Number(product.stepPrice)}
                          disabled={isBidding || isBanned || isCheckingBan}
                          isBidding={isBidding}
                          label="Place Bid"
                        />
                        {product.buyNowPrice && (
                          <Button
                            variant="primary"
                            onClick={() => setShowBuyNowConfirm(true)}
                            className="w-full"
                            disabled={isBidding || isBuying}
                          >
                            {isBuying
                              ? "Processing..."
                              : `Buy Now for ${formatPrice(product.buyNowPrice)}`}
                          </Button>
                        )}
                      </div>
                      {!user && (
                        <button
                          onClick={onNavigateToAuth}
                          className="w-full text-xs text-primary underline"
                        >
                          Login to bid
                        </button>
                      )}
                    </>
                  );
                }
              })()}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center text-blue-800 text-sm">
              You are the seller.
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <h3 className="font-bold text-gray-600 py-3">Auction Ended</h3>
          {(isWinner || (isSeller && product.currentBidder)) && (
            <Button onClick={onFinishPayment}>Proceed to Payment</Button>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmBid}
        title="Confirm Bid"
        message={`Are you sure you want to place a bid of ${formatPrice(bidAmount)}?`}
        confirmText="Place Bid"
        confirmVariant="primary"
      />

      {/* Confirm Dialog for Buy Now */}
      <ConfirmDialog
        isOpen={showBuyNowConfirm}
        onClose={() => setShowBuyNowConfirm(false)}
        onConfirm={handleConfirmBuyNow}
        title="Confirm Buy Now"
        message={`Are you sure you want to buy this product immediately for ${formatPrice(product.buyNowPrice)}?`}
        confirmText="Buy Now"
        confirmVariant="primary"
        isLoading={isBuying}
      />
    </div>
  );
};

export default ProductInfoSidebar;
