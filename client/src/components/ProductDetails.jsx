import React, { useState } from "react";
import Badge from "./common/Badge";
import ImageGallery from "./common/ImageGallery";
import CountdownTimer from "./common/CountdownTimer";
import BidControls from "./common/BidControls";
import TabNavigation from "./common/TabNavigation";
import AuctionSection from "./sections/AuctionSection";

// Dữ liệu Related Products vẫn giữ lại vì nó là dữ liệu SAMPLE, 
// không liên quan trực tiếp đến sản phẩm hiện tại mà là dữ liệu gợi ý.

const relatedProducts = [
  {
    id: 101,
    lotNumber: "576894",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    title: "Premium Headphones Collection",
    currentBid: 2458,
    status: "live",
    timeLeft: { days: 52, hours: 13, minutes: 32, seconds: 48 },
  },
  {
    id: 102,
    lotNumber: "679542",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    title: "Luxury Watch Limited Edition",
    currentBid: 5200,
    status: "live",
    timeLeft: { days: 45, hours: 8, minutes: 15, seconds: 30 },
  },
  {
    id: 103,
    lotNumber: "467188",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop",
    title: "Designer Sneakers Rare",
    currentBid: 1850,
    status: "live",
    timeLeft: { days: 38, hours: 22, minutes: 45, seconds: 12 },
  },
  {
    id: 104,
    lotNumber: "258967",
    image:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop",
    title: "Vintage Camera Collection",
    currentBid: 3100,
    status: "live",
    timeLeft: { days: 29, hours: 14, minutes: 28, seconds: 55 },
  },
  {
    id: 105,
    lotNumber: "238964",
    image:
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop",
    title: "Modern Art Sculpture",
    currentBid: 4750,
    status: "live",
    timeLeft: { days: 60, hours: 5, minutes: 38, seconds: 20 },
  },
];
// Helper function để che tên người dùng
const maskUserName = (userName) => {
  if (!userName || typeof userName !== 'string') return "*****";

  const nameLength = userName.length;
  const maskLength = Math.floor(nameLength * 0.8);

  const visiblePart = userName.substring(maskLength);

  const maskedPart = '*****';

  return maskedPart + visiblePart;
};
const ProductDetails = ({ product, className = "" }) => {
  const [bidAmount, setBidAmount] = useState(
    (product?.currentBid || 0) + (product?.stepPrice || 0)
  );

  const [activeTab, setActiveTab] = useState("description");

  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price || 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateRating = (plus, minus) => {
    const total = plus + minus;
    if (total === 0) return "No ratings";
    const percentage = ((plus / total) * 100).toFixed(1);
    return `${plus}/${total} (${percentage}%)`;
  };

  // Tính số ngày còn lại đến khi kết thúc đấu giá
  const getDaysUntilEnd = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 0;

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // Format ngày giờ kết thúc theo định dạng: Date: 19/11/2025, 8:30 AM
  const formatEndDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `Date: ${day}/${month}/${year}, ${displayHours}:${minutes} ${ampm}`;
  };

  const handleBidChange = (newAmount) => {
    setBidAmount(newAmount);
  };

  const handlePlaceBid = () => {
    // Logic đặt giá
    console.log("Placing bid:", bidAmount);
    // Có thể thêm API call ở đây
    alert(
      `Bid placed: $${bidAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    );
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column - Images */}
        <ImageGallery images={product.images || []} alt={product.name} />

        {/* Right Column - Product Info */}
        <div className="space-y-3">
          {/* Title */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1.5">
              {product.name}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Current Bid & Buy Now Price */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Bid */}
            <div>
              <p className="text-[10px] text-gray-600 font-medium mb-0.5">
                Current bid:
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(product.currentBid)}
              </p>
            </div>

            {/* Buy Now Price */}
            {product.buyNowPrice && (
              <div>
                <p className="text-[10px] text-gray-600 font-medium mb-0.5">
                  Buy now price:
                </p>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(product.buyNowPrice)}
                </p>
              </div>
            )}
          </div>

          {/* Posted Date */}
          {product.createdAt && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-[10px] text-gray-600 font-medium mb-0.5">
                Posted on:
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDateTime(product.createdAt)}
              </p>
            </div>
          )}

          {/* Seller Info */}
          {product.seller && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-[10px] text-gray-600 font-medium mb-1">
                Seller Information:
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {product.seller.name}
                </p>
                <Badge variant="lightPrimary" size="xs">
                  Rating:{" "}
                  {calculateRating(
                    product.seller.ratingPlus || 0,
                    product.seller.ratingMinus || 0,
                  )}
                </Badge>
              </div>
            </div>
          )}

          {/* Current Highest Bidder */}
          {product.currentBidder && (
            <div className="bg-green-50 rounded-lg px-3 py-2 border border-green-200">
              <p className="text-[10px] text-gray-600 font-medium mb-1">
                Current highest bidder:
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {product.currentBidder.name}
                </p>
                <Badge variant="success" size="xs">
                  Rating:{" "}
                  {calculateRating(
                    product.currentBidder.ratingPlus || 0,
                    product.currentBidder.ratingMinus || 0,
                  )}
                </Badge>
              </div>
            </div>
          )}

          {/* Hiển thị thời gian còn lại */}
          {product.auctionEndDate && (
            <div>
              <p className="text-[10px] font-medium text-gray-700 mb-1.5">
                Time left:
              </p>
              {getDaysUntilEnd(product.auctionEndDate) > 3 ? (
                // Nếu còn > 3 ngày: Hiển thị ngày giờ kết thúc
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-blue-800">
                    📅 {formatEndDate(product.auctionEndDate)}
                  </p>
                </div>
              ) : (
                // Nếu còn ≤ 3 ngày: Hiển thị countdown timer
                <CountdownTimer
                  endDate={product.auctionEndDate}
                  timezone={product.timezone}
                  variant="compact"
                />
              )}
            </div>
          )}

          {/* Bid Controls */}
          <BidControls
            currentBid={product.currentBid || 0}
            bidAmount={bidAmount}
            onBidChange={handleBidChange}
            onBid={handlePlaceBid}
            minBidIncrement={product.stepPrice || 0}
          />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-6">
        <TabNavigation
          tabs={[
            { key: "description", label: "Description" },
            { key: "auctionHistory", label: "Auction History" },
            { key: "qna", label: `Q&A (${product.qnaItems?.length || 0})` },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === "description" && (
            <div className="max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Product Description
              </h2>

              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                {product.fullDescription
                  ?.split("\n\n") // Sử dụng optional chaining (?) để đề phòng fullDescription là null/undefined
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  )) || <p>No detailed description available.</p>}
              </div>
            </div>
          )}

          {activeTab === "auctionHistory" && (
            <div className="max-w-none">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.bidHistory && product.bidHistory.length > 0 ? (
                      product.bidHistory.map((bid) => (
                        <tr key={bid.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(bid.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(bid.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {maskUserName(bid.user)}
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-8 text-center text-sm text-gray-500"
                        >
                          No auction history available yet.
                        </td>
                      </tr>
                    )}
                    {/* Auction Started Row */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(product.createdAt)}
                      </td>
                      <td
                        colSpan="3"
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic"
                      >
                        Auction started
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "qna" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Questions & Answers
              </h3>

              {product.qnaItems && product.qnaItems.length > 0 ? (
                <div className="space-y-4">
                  {product.qnaItems.map((qna) => (
                    <div
                      key={qna.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm text-gray-900">
                            Q: {qna.questionText}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Asked by {qna.questioner?.fullName || 'Anonymous'} on{" "}
                          {formatDateTime(qna.questionTime)}
                        </p>
                      </div>

                      {qna.answerText ? (
                        <div className="mt-3 pl-4 border-l-2 border-primary">
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">A:</span>{" "}
                            {qna.answerText}
                          </p>
                          <p className="text-xs text-gray-500">
                            Answered on {formatDateTime(qna.answerTime)}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 pl-4 border-l-2 border-gray-300">
                          <p className="text-sm text-gray-500 italic">
                            Waiting for answer from seller...
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No questions yet. Be the first to ask!
                  </p>
                </div>
              )}

              {/* Ask Question Button */}
              <div className="mt-6">
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                  Ask a Question
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-6">
          <AuctionSection
            title="Related"
            subtitle="Products"
            items={relatedProducts}
            itemsPerView={5}
            showFilter={false}
            className=""
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;