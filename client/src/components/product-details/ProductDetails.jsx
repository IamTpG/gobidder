import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useRelatedProducts from "../../hooks/useRelatedProducts";
import useBanBidder from "../../hooks/useBanBidder";
import useBannedStatus from "../../hooks/useBannedStatus";
import { useWatchlist } from "../../hooks/useWatchlist";
import {
  formatDateTime,
  formatPrice,
  maskUserName,
} from "../../utils/formatters";
import {
  createProductQuestion,
  answerProductQuestion,
  placeBid,
  getMyAutoBid,
  createTransactionForProduct,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import ImageGallery from "../common/ImageGallery";
import TabNavigation from "../common/TabNavigation";
import AuctionSection from "../home/ProductSection";
import ProductInfoSidebar from "./ProductInfoSidebar";
import ProductQnA from "./ProductQnA";
import TransactionRating from "./TransactionRating";
import "../../styles/ProductDetails.css";

const ProductDetails = ({ product, onRefresh }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isSeller = user && product?.seller && user.id === product.seller.id;

  // State
  const [activeTab, setActiveTab] = useState("description");
  const [bidAmount, setBidAmount] = useState(0);
  const [myAutoBidPrice, setMyAutoBidPrice] = useState(0);
  const [banTarget, setBanTarget] = useState(null);
  const [banFeedback, setBanFeedback] = useState(null);

  // Loading & Error States
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccessMsg, setBidSuccessMsg] = useState(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState({});
  const { banBidder, isLoading: isBanning, error: banError } = useBanBidder();
  const { isBanned, isLoading: isCheckingBan } = useBannedStatus(
    product?.id,
    !!user && !isSeller
  );

  // Hooks
  const { products: relatedProducts } = useRelatedProducts(product?.id, 5);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Handle watchlist toggle
  const handleWatchlistToggle = async (productId) => {
    if (!user) {
      navigate("/auth", { state: { from: location } });
      return;
    }
    try {
      await toggleWatchlist(productId);
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  // Initial Logic
  useEffect(() => {
    if (product) {
      const minBid =
        Number(product.currentBid) === 0
          ? Number(product.startPrice)
          : Number(product.currentBid) + Number(product.stepPrice);
      setBidAmount(minBid);

      // Get Auto Bid Info
      getMyAutoBid(product.id)
        .then((res) => setMyAutoBidPrice(res.myAutoBidPrice))
        .catch((err) => console.error(err));
    }
  }, [product]);

  useEffect(() => {
    setBanFeedback(null);
    setBanTarget(null);
  }, [product?.id]);

  // Handle Query Params (Scroll to QnA)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openQ = params.get("openQ");
    if (openQ) {
      setActiveTab("qna");
      setTimeout(() => {
        const el = document.getElementById(`q-${openQ}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [location.search]);

  if (!product) return null;

  const handlePlaceBid = async () => {
    if (isBanned) {
      setBidError("You are banned from bidding on this product.");
      return;
    }
    if (!user) return navigate("/auth", { state: { from: location } });

    try {
      setIsBidding(true);
      setBidError(null);
      setBidSuccessMsg(null);

      const result = await placeBid(product.id, Number(bidAmount));

      setBidSuccessMsg("Bid placed successfully!");
      if (Number(result.currentPrice) <= Number(product.currentBid)) {
        setBidSuccessMsg("Bid placed! Your auto-bid keeps you winning.");
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      setBidError(err.response?.data?.message || "Bid failed.");
    } finally {
      setIsBidding(false);
    }
  };

  const openBanModal = (bid) => {
    setBanFeedback(null);
    setBanTarget(bid);
  };

  const handleBanBidder = async () => {
    if (!banTarget) return;
    try {
      await banBidder({
        productId: product.id,
        bidderId: banTarget.userId,
      });
      setBanFeedback("Bidder has been banned and the auction updated.");
      setBanTarget(null);
      if (onRefresh) onRefresh();
    } catch (e) {
      // Error handled by hook state
    }
  };

  const handleFinishPayment = async () => {
    try {
      if (product.transaction?.id) {
        navigate(`/transactions/${product.transaction.id}`);
      } else {
        const res = await createTransactionForProduct(product.id);
        const txId = res.data?.id || res.id;
        if (txId) navigate(`/transactions/${txId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitQuestion = async (text) => {
    try {
      await createProductQuestion(product.id, { question_text: text });
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitAnswer = async (qId, text) => {
    try {
      setIsSubmittingAnswer((prev) => ({ ...prev, [qId]: true }));
      await answerProductQuestion(product.id, qId, { answer_text: text });
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAnswer((prev) => ({ ...prev, [qId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <ImageGallery images={product.images || []} alt={product.name} />

        {/* Right: Info Sidebar */}
        <ProductInfoSidebar
          product={product}
          user={user}
          bidAmount={bidAmount}
          isBidding={isBidding}
          bidError={bidError}
          bidSuccessMsg={bidSuccessMsg}
          myAutoBidPrice={myAutoBidPrice}
          onBidChange={setBidAmount}
          onPlaceBid={handlePlaceBid}
          onNavigateToAuth={() =>
            navigate("/auth", { state: { from: location } })
          }
          onFinishPayment={handleFinishPayment}
          isBanned={isBanned}
          isCheckingBan={isCheckingBan}
          isInWatchlist={user ? isInWatchlist(product.id) : false}
          onWatchlistToggle={handleWatchlistToggle}
        />
      </div>

      {/* Transaction Rating Section */}
      {product?.transaction && (
        <TransactionRating
          transaction={product.transaction}
          user={user}
          onRateSuccess={onRefresh}
        />
      )}

      {/* Tabs Section */}
      <div className="mt-12">
        <TabNavigation
          tabs={[
            { key: "description", label: "Description" },
            { key: "history", label: "Auction History" },
            { key: "qna", label: `Q&A (${product.qnaItems?.length || 0})` },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
          className="mb-6 border-b border-gray-200"
        />

        <div className="min-h-[200px]">
          {activeTab === "description" && (
            <div
              className="description-content prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-600
                prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2
                prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2
                prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: product.fullDescription }}
            />
          )}

          {activeTab === "history" && (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    {isSeller && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banError && (
                    <tr>
                      <td
                        colSpan={isSeller ? 4 : 3}
                        className="px-6 py-3 text-sm text-red-700 bg-red-50"
                      >
                        {banError}
                      </td>
                    </tr>
                  )}
                  {banFeedback && (
                    <tr>
                      <td
                        colSpan={isSeller ? 4 : 3}
                        className="px-6 py-3 text-sm text-green-700 bg-green-50"
                      >
                        {banFeedback}
                      </td>
                    </tr>
                  )}
                  {product.bidHistory?.map((bid) => (
                    <tr key={bid.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDateTime(bid.date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary">
                        {formatPrice(bid.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {isSeller ? bid.user : maskUserName(bid.user)}
                      </td>
                      {isSeller && (
                        <td className="px-6 py-4 text-sm text-right">
                          <button
                            onClick={() => openBanModal(bid)}
                            className="text-red-600 hover:text-red-800 text-2xl font-bold leading-none transition-colors"
                            aria-label="Ban bidder"
                            title="Ban this bidder"
                          >
                            ×
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {!product.bidHistory?.length && (
                    <tr>
                      <td
                        colSpan={isSeller ? 4 : 3}
                        className="text-center py-4 text-gray-500"
                      >
                        No history available.
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDateTime(product.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Auction started
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500"></td>
                    {isSeller && <td className="px-6 py-4"></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "qna" && (
            <ProductQnA
              product={product}
              user={user}
              onSubmitQuestion={handleSubmitQuestion}
              onSubmitAnswer={handleSubmitAnswer}
              isSubmittingMap={isSubmittingAnswer}
            />
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts?.length > 0 && (
        <div className="mt-12 border-t pt-12">
          <AuctionSection
            title="Related Products"
            items={relatedProducts}
            itemsPerView={5}
          />
        </div>
      )}

      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border-t-4 border-primary">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ban bidder?
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to ban {banTarget.user} from this auction?
                They will no longer be able to place bids on this product.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setBanTarget(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanBidder}
                  disabled={isBanning}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-70"
                >
                  {isBanning ? "Banning..." : "Confirm Ban"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
