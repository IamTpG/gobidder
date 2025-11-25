import React from "react";
import { useNavigate } from "react-router-dom";
import { useMyBids } from "../../hooks/useMyBids";
import Spinner from "../common/Spinner";
import Badge from "../common/Badge";

const MyBidsSection = () => {
  const { activeTab, setActiveTab, bids, isLoading, error } = useMyBids();
  const navigate = useNavigate();

  // Format giá
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(Number(price));

  // Sub-component: Thẻ sản phẩm đấu giá
  const BidCard = ({ item }) => {
    // Xác định trạng thái để hiển thị màu sắc
    const isWon = activeTab === "won";
    const isLeading = item.isLeading;

    return (
      <div
        onClick={() => navigate(`/products/${item.productId}`)}
        className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow cursor-pointer group"
      >
        {/* Image */}
        <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-[#00B289] transition-colors">
                {item.productName}
              </h3>
              {/* Status Badge */}
              {isWon ? (
                <Badge variant="success" size="sm">
                  Won
                </Badge>
              ) : (
                <Badge variant={isLeading ? "success" : "warning"} size="sm">
                  {isLeading ? "Leading" : "Outbid"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Seller: {item.sellerName}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-[10px] text-gray-500 uppercase font-bold">
                Current Price
              </p>
              <p className="text-sm font-bold text-gray-900">
                {formatPrice(item.currentPrice || item.finalPrice)}
              </p>
            </div>
            <div
              className={`${isLeading || isWon ? "bg-green-50" : "bg-red-50"} p-2 rounded-lg`}
            >
              <p
                className={`text-[10px] uppercase font-bold ${isLeading || isWon ? "text-green-600" : "text-red-600"}`}
              >
                Your Max Bid
              </p>
              <p
                className={`text-sm font-bold ${isLeading || isWon ? "text-green-700" : "text-red-700"}`}
              >
                {formatPrice(item.myMaxBid)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bids</h2>
          <p className="text-sm text-gray-500">
            Manage your auctions and won items.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "active"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active Bids
          </button>
          <button
            onClick={() => setActiveTab("won")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "won"
                ? "bg-white text-[#00B289] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Won Items
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" className="text-[#00B289]" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-semibold underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {activeTab === "active" ? "No active bids" : "No won items yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {activeTab === "active"
              ? "You haven't placed any bids on active auctions."
              : "Keep bidding! You haven't won any auctions yet."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#00B289] hover:bg-[#009974] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Explore Auctions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bids.map((item) => (
            <BidCard key={item.productId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBidsSection;
