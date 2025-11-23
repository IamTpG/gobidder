import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Badge from "./common/Badge";
import ImageGallery from "./common/ImageGallery";
import CountdownTimer from "./common/CountdownTimer";
import BidControls from "./common/BidControls";
import TabNavigation from "./common/TabNavigation";
import AuctionSection from "./sections/AuctionSection";
import { useAuth } from "../contexts/AuthContext";
import useRelatedProducts from "../hooks/useRelatedProducts";
import {
  createProductQuestion,
  answerProductQuestion,
  placeBid,
  getMyAutoBid,
} from "../services/api";

// Helper function để che tên người dùng
const maskUserName = (userName) => {
  if (!userName || typeof userName !== "string") return "*****";

  const nameLength = userName.length;
  const maskLength = Math.floor(nameLength * 0.8);

  const visiblePart = userName.substring(maskLength);

  const maskedPart = "*****";

  return maskedPart + visiblePart;
};

const ProductDetails = ({ product, onRefresh, className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const minBidAmount = product
    ? Number(product.currentBid) === 0
      ? Number(product.startPrice)
      : Number(product.currentBid) + Number(product.stepPrice)
    : 0;

  const [bidAmount, setBidAmount] = useState(minBidAmount);
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccessMsg, setBidSuccessMsg] = useState(null);

  const [myAutoBidPrice, setMyAutoBidPrice] = useState(0);

  const [activeTab, setActiveTab] = useState("description");
  const [newQuestion, setNewQuestion] = useState("");
  const [answerText, setAnswerText] = useState({});
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState({});

  // Related products from server (same category_id)
  const { products: relatedProducts } = useRelatedProducts(product?.id, 5);

  useEffect(() => {
    if (product) {
      const newMin =
        Number(product.currentBid) === 0
          ? Number(product.startPrice)
          : Number(product.currentBid) + Number(product.stepPrice);
      setBidAmount(newMin);

      const fetchMyAutoBid = async () => {
        try {
          const result = await getMyAutoBid(product.id);
          setMyAutoBidPrice(result.myAutoBidPrice);
        } catch (err) {
          console.error("Error fetching MyAutoBidPrice:", err);
        }
      };

      fetchMyAutoBid();
    }
  }, [product]);

  // Xử lý query param openQ để tự động mở tab Q&A và scroll
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openQ = params.get("openQ");
    if (openQ) {
      setActiveTab("qna");
      // Delay scroll để đảm bảo DOM đã render
      setTimeout(() => {
        const element = document.getElementById(`q-${openQ}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlight-question");
          setTimeout(
            () => element.classList.remove("highlight-question"),
            2000,
          );
        }
      }, 300);
    }
  }, [location.search]);

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
    // Xóa lỗi khi user nhập lại
    if (bidError) setBidError(null);
    if (bidSuccessMsg) setBidSuccessMsg(null);
  };

  const handlePlaceBid = async () => {
    if (!user) {
      // Nếu chưa login, chuyển sang trang login, lưu lại đường dẫn hiện tại để quay lại
      navigate("/auth", { state: { from: location } });
      return;
    }

    if (bidAmount < minBidAmount) {
      setBidError(`Bid must be at least ${formatPrice(minBidAmount)}`);
      return;
    }

    try {
      setIsBidding(true);
      setBidError(null);
      setBidSuccessMsg(null);

      const result = await placeBid(product.id, bidAmount);

      setBidSuccessMsg("Bid placed successfully!");

      if (Number(result.currentPrice) <= Number(product.currentBid)) {
        setBidSuccessMsg(
          "Bid placed! Since your max bid is higher, you remain the winner.",
        );
      }

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to place bid.";
      setBidError(msg);
    } finally {
      setIsBidding(false);
    }
  };

  // Handler cho submit câu hỏi
  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      return;
    }

    if (!user) {
      return;
    }

    try {
      setIsSubmittingQuestion(true);
      await createProductQuestion(product.id, { question_text: newQuestion });
      setNewQuestion("");
      if (onRefresh) onRefresh(); // Refresh product data
    } catch (error) {
      console.error("Error submitting question:", error);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Handler cho submit câu trả lời
  const handleSubmitAnswer = async (questionId) => {
    const answer = answerText[questionId];
    if (!answer || !answer.trim()) {
      return;
    }

    try {
      setIsSubmittingAnswer((prev) => ({ ...prev, [questionId]: true }));
      await answerProductQuestion(product.id, questionId, {
        answer_text: answer,
      });
      setAnswerText((prev) => ({ ...prev, [questionId]: "" }));
      if (onRefresh) onRefresh(); // Refresh product data
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmittingAnswer((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Kiểm tra xem User có phải là Seller không
  const isSeller = user && product.seller && user.id === product.seller.id;

  // Kiểm tra xem phiên đấu giá đã kết thúc chưa
  const isAuctionEnded = new Date() > new Date(product.auctionEndDate);

  // Kiểm tra mình có phải winner không
  const isWinner =
    user && product.currentBidder && user.id === product.currentBidder.id;

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
            <div
              className={`rounded-xl px-4 py-3 border transition-all duration-300 ${
                isWinner
                  ? "bg-[#00B289]/10 border-[#00B289] shadow-sm"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isWinner ? "text-[#009974]" : "text-gray-500"
                  }`}
                >
                  {isWinner ? "You are winning!" : "Current Highest Bidder"}
                </p>

                <Badge
                  variant={isWinner ? "success" : "lightPrimary"}
                  size="xs"
                >
                  Rating:{" "}
                  {calculateRating(
                    product.currentBidder.ratingPlus || 0,
                    product.currentBidder.ratingMinus || 0,
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isWinner ? "text-[#007F61]" : "text-gray-900"
                      }`}
                    >
                      {isWinner
                        ? "You (Current Leader)"
                        : maskUserName(product.currentBidder.name)}
                    </p>
                  </div>
                </div>

                {isWinner && (
                  <div className="bg-yellow-100 p-1.5 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-yellow-600"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hiển thị Max Bid nếu đã từng đặt */}
          {myAutoBidPrice > 0 && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-[10px] text-gray-600 font-medium mb-1">
                Your max bid:
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(myAutoBidPrice)}
                </p>
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
          {!isAuctionEnded ? (
            !isSeller ? (
              <div className="space-y-2">
                {/* Hiển thị thông báo Lỗi hoặc Thành công */}
                {bidError && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                    {bidError}
                  </div>
                )}
                {bidSuccessMsg && (
                  <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
                    {bidSuccessMsg}
                  </div>
                )}

                {/* Component điều khiển đặt giá */}
                <BidControls
                  currentBid={Number(product.currentBid) || 0}
                  bidAmount={bidAmount}
                  onBidChange={handleBidChange}
                  onBid={handlePlaceBid}
                  minBidIncrement={Number(product.stepPrice) || 0}
                  disabled={isBidding} // Disable khi đang gọi API
                  isBidding={isBidding} // Prop để hiển thị spinner trong nút (nếu BidControls hỗ trợ)
                  label="Place Max Bid"
                />
                <p className="text-xs text-gray-500 italic text-center">
                  *Enter your maximum limit. Our system will automatically bid
                  for you.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-800 font-medium">
                  You are the seller of this product.
                </p>
              </div>
            )
          ) : (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
              <p className="text-lg font-bold text-gray-600">Auction Ended</p>
              {product.currentBidder ? (
                <p className="text-sm text-gray-500 mt-1">
                  Winner: {maskUserName(product.currentBidder.name)}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">No winner</p>
              )}
            </div>
          )}
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
                      id={`q-${qna.id}`}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-colors"
                    >
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm text-gray-900">
                            Q: {qna.questionText}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Asked by {qna.questioner?.fullName || "Anonymous"} on{" "}
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
                        <>
                          {/* Chỉ seller mới có thể trả lời */}
                          {user &&
                          product.seller &&
                          user.id === product.seller.id ? (
                            <div className="mt-3 pl-4 border-l-2 border-gray-300">
                              <textarea
                                value={answerText[qna.id] || ""}
                                onChange={(e) =>
                                  setAnswerText((prev) => ({
                                    ...prev,
                                    [qna.id]: e.target.value,
                                  }))
                                }
                                placeholder="Type your answer here..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                rows="3"
                              />
                              <button
                                onClick={() => handleSubmitAnswer(qna.id)}
                                disabled={isSubmittingAnswer[qna.id]}
                                className="mt-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmittingAnswer[qna.id]
                                  ? "Submitting..."
                                  : "Submit Answer"}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 pl-4 border-l-2 border-gray-300">
                              <p className="text-sm text-gray-500 italic">
                                Waiting for answer from seller...
                              </p>
                            </div>
                          )}
                        </>
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

              {/* Form hỏi câu hỏi mới */}
              {/* Chỉ hiển thị nếu user không phải là seller */}
              {(!user || (product.seller && user.id !== product.seller.id)) && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Ask a Question
                  </h4>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type your question about this product..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                    rows="4"
                    disabled={!user}
                  />
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={isSubmittingQuestion || !user}
                    className="mt-3 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingQuestion
                      ? "Submitting..."
                      : user
                        ? "Submit Question"
                        : "Login to Ask Question"}
                  </button>
                </div>
              )}

              {/* Thông báo cho seller */}
              {user && product.seller && user.id === product.seller.id && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> As the seller of this product, you
                    can only answer questions, not ask them.
                  </p>
                </div>
              )}
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
