import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { useTransaction } from "../hooks/useTransaction";
import TransactionInfo from "../components/transaction/TransactionInfo";
import PaymentStep from "../components/transaction/PaymentStep";
import ShippingStep from "../components/transaction/ShippingStep";
import { ReceiptStep, RatingStep } from "../components/transaction/ReviewSteps";
import TransactionChat from "../components/transaction/TransactionChat";
import TransactionCancel from "../components/transaction/TransactionCancel";
import Spinner from "../components/common/Spinner";

const TransactionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Data Logic extracted to Hook
  const { tx, messages, loading, error, refresh } = useTransaction(id);

  // 2. Local UI State for Feedback
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleSuccess = (msg) => setFeedback({ type: "success", message: msg });
  const handleError = (msg) => setFeedback({ type: "error", message: msg });

  if (loading)
    return (
      <div className="p-12 flex justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  if (error || !tx)
    return (
      <div className="p-6 text-center text-red-600">
        {error || "Transaction not found"}
      </div>
    );

  const isSeller = user?.id === tx.seller_id;
  const isWinner = user?.id === tx.winner_id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-gray-500 hover:text-primary flex items-center gap-1"
      >
        ← Back to list
      </button>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`mb-6 p-4 rounded-lg border flex justify-between items-center ${feedback.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback({ type: "", message: "" })}
            className="text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Info & Progress (Chiếm 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <TransactionInfo tx={tx} />

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-gray-900">
              Transaction Progress
            </h3>
            <ol className="space-y-8 relative border-l border-gray-200 ml-3">
              {/* Step 1 */}
              <li className="ml-6">
                <span
                  className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${tx.status === "PendingPayment" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                >
                  1
                </span>
                <PaymentStep
                  tx={tx}
                  isWinner={isWinner}
                  onRefresh={refresh}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </li>

              {/* Step 2 */}
              <li className="ml-6">
                <span
                  className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${["PendingPayment"].includes(tx.status) ? "bg-gray-100" : tx.status === "PendingShipping" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                >
                  2
                </span>
                <ShippingStep
                  tx={tx}
                  isSeller={isSeller}
                  onRefresh={refresh}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </li>

              {/* Step 3 */}
              <li className="ml-6">
                <span
                  className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${["PendingPayment", "PendingShipping"].includes(tx.status) ? "bg-gray-100" : tx.status === "PendingReceipt" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                >
                  3
                </span>
                <ReceiptStep
                  tx={tx}
                  isWinner={isWinner}
                  onRefresh={refresh}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </li>

              {/* Step 4 */}
              <li className="ml-6">
                <span
                  className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${tx.status === "Completed" ? "bg-blue-100 text-blue-600" : "bg-gray-100"}`}
                >
                  4
                </span>
                <RatingStep
                  tx={tx}
                  user={user}
                  onRefresh={refresh}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </li>
            </ol>

            {/* Cancel Section (Only for Seller) */}
            {isSeller && (
              <TransactionCancel
                tx={tx}
                onRefresh={refresh}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Chat (Chiếm 1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <TransactionChat
              tx={tx}
              messages={messages}
              currentUser={user}
              onRefresh={refresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
