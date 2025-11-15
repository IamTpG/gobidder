import React, { useState } from "react";
import Badge from "./common/Badge";
import ImageGallery from "./common/ImageGallery";
import CountdownTimer from "./common/CountdownTimer";
import BidControls from "./common/BidControls";
import TabNavigation from "./common/TabNavigation";
import AuctionSection from "./sections/AuctionSection";

const ProductDetails = ({
  product = {
    id: 1,
    name: "Building Wealth Through Real Estate: A Guide",
    description:
      "Aptent taciti sociosa litor torquen per conubia nostra, per incep placerat felis non aliquam.Mauris nec justo vitae ante auctor.",
    currentBid: 22007.0,
    buyNowPrice: 22507.0,
    startPrice: 10000.0,
    stepPrice: 500.0,
    auctionEndDate: "2026-01-30T12:00:00",
    createdAt: "2024-11-01T10:00:00",
    timezone: "UTC 0",
    category: "Real Estate",
    bidCount: 15,
    // Thông tin người bán
    seller: {
      name: "John Smith",
      ratingPlus: 45,
      ratingMinus: 5,
    },
    // Thông tin người đặt giá cao nhất
    currentBidder: {
      name: "Jane Doe",
      ratingPlus: 30,
      ratingMinus: 2,
    },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=200&fit=crop",
    ],
    // Lịch sử đặt giá
    bidHistory: [
      { id: 1, date: "2024-11-14T09:00:00", amount: 22007.0, user: "Jane Doe" },
      {
        id: 2,
        date: "2024-11-13T15:30:00",
        amount: 21507.0,
        user: "Mike Davis",
      },
      { id: 3, date: "2024-11-12T14:20:00", amount: 21007.0, user: "Jane Doe" },
      {
        id: 4,
        date: "2024-11-11T10:15:00",
        amount: 20507.0,
        user: "Sarah Wilson",
      },
      {
        id: 5,
        date: "2024-11-10T16:45:00",
        amount: 20007.0,
        user: "Tom Brown",
      },
    ],
    // Q&A
    qnaItems: [
      {
        id: 1,
        questionText: "Is the property still available for viewing?",
        questionTime: "2024-11-10T10:00:00",
        questionerId: 2,
        questioner: {
          id: 2,
          fullName: "Bob Johnson",
          ratingPlus: 20,
          ratingMinus: 1,
        },
        answerText: "Yes, viewings are available on weekdays from 2-5 PM.",
        answerTime: "2024-11-10T14:00:00",
      },
      {
        id: 2,
        questionText: "What is the property tax rate?",
        questionTime: "2024-11-12T09:30:00",
        questionerId: 3,
        questioner: {
          id: 3,
          fullName: "Alice Williams",
          ratingPlus: 35,
          ratingMinus: 3,
        },
        answerText: "The annual property tax is approximately $2,500.",
        answerTime: "2024-11-12T15:00:00",
      },
      {
        id: 3,
        questionText: "Are pets allowed in this property?",
        questionTime: "2024-11-13T11:00:00",
        questionerId: 4,
        questioner: {
          id: 4,
          fullName: "Charlie Brown",
          ratingPlus: 10,
          ratingMinus: 0,
        },
        answerText: null,
        answerTime: null,
      },
    ],
    fullDescription: `Urna Aenean onewaryzo eleifend vitae tellus a facilisis. Nunc posuere at augue eget port. Inei odion goet tellus, dignissim fermentumara purus nec, consequat dapibus metus. Vav urna worlda mauris, goat te faucibus at egestas quis, fermentum egetonav neque. Dphare lectus nec risuonl pellentesque, opi vitae aliquet nisi dapibus. Sed volutpat mi velit.

Urna Aenean onewaryzo eleifend vitae tellus a facilisis. Nunc posuere at augue eget port. Inei odion goet tellus, dignissim fermentumara purus nec.

Nunc posuere at augue eget porta. Inei odion goat tellus, dignissim fermentumara purus nec, consequat dapibus metus.Vivamus urna worlda mauris, goat te faucibus at egestas quis, fermentum egetonav neque. Duis pharetra lectus nec risuonl pellentesque, opi vitae aliquet nisi dapibus. Sed volutpat mi velit, ateng maximus est eleifend accui Fusce porttitor ex ercu, Phasellus viverra lorem an nibh placerat tincidunt.bologtai Aliquam andit rutrum elementum urna, velgeria fringilla tellus varius ut. Morbi non velit odio.`,
  },
  className = "",
}) => {
  const [bidAmount, setBidAmount] = useState(
    product.currentBid + product.stepPrice,
  );
  const [activeTab, setActiveTab] = useState("description");

  // Helper functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDateTime = (dateString) => {
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

  const formatRelativeTime = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    // Chỉ hiển thị relative time nếu còn ít hơn 3 ngày
    if (days >= 3) return null;

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} left`;
    } else {
      return `${minutes} minute${minutes > 1 ? "s" : ""} left`;
    }
  };

  // Sample related products data
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
        <ImageGallery images={product.images} alt={product.name} />

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

          {/* Seller Info */}
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
                  product.seller.ratingPlus,
                  product.seller.ratingMinus,
                )}
              </Badge>
            </div>
          </div>

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
                    product.currentBidder.ratingPlus,
                    product.currentBidder.ratingMinus,
                  )}
                </Badge>
              </div>
            </div>
          )}

          {/* Thời điểm kết thúc (relative time nếu < 3 ngày) */}
          {formatRelativeTime(product.auctionEndDate) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-sm font-semibold text-amber-800">
                ⏰ {formatRelativeTime(product.auctionEndDate)}
              </p>
            </div>
          )}

          {/* Countdown Timer */}
          <div>
            <p className="text-[10px] font-medium text-gray-700 mb-1.5">
              Time left:
            </p>
            <CountdownTimer
              endDate={product.auctionEndDate}
              timezone={product.timezone}
              variant="compact"
            />
          </div>

          {/* Bid Controls */}
          <BidControls
            currentBid={product.currentBid}
            bidAmount={bidAmount}
            onBidChange={handleBidChange}
            onBid={handlePlaceBid}
            minBidIncrement={product.stepPrice}
          />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-6">
        <TabNavigation
          tabs={[
            { key: "description", label: "Description" },
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
                  .split("\n\n")
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
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
                          Asked by {qna.questioner.fullName} on{" "}
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
