import React, { useState } from "react";

import { cancelTransaction } from "../../services/api";

const TransactionCancel = ({ tx, onRefresh, onError, onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("Bidder doesn't pay");
  const [processing, setProcessing] = useState(false);

  // Chỉ hiển thị nếu chưa hoàn thành hoặc chưa hủy
  if (["Completed", "Cancelled"].includes(tx.status)) return null;

  const handleCancel = async () => {
    try {
      setProcessing(true);
      await cancelTransaction(tx.id, reason || "Seller cancelled");
      onSuccess("Transaction cancelled successfully.");
      setShowForm(false);
      onRefresh();
    } catch (err) {
      onError(err.response?.data?.message || "Failed to cancel");
    } finally {
      setProcessing(false);
    }
  };

  if (!showForm) {
    return (
      <div className="mt-8 pt-4 border-t">
        <button
          onClick={() => setShowForm(true)}
          className="text-red-600 text-sm hover:underline font-medium"
        >
          Cancel this transaction
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
      <h5 className="text-sm font-bold text-red-700 mb-2">
        Confirm Cancellation
      </h5>
      <p className="text-xs text-red-600 mb-2">This action cannot be undone.</p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for cancellation (optional)"
        className="w-full border p-2 rounded text-sm mb-3 focus:border-red-500 focus:ring-red-200"
      />

      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          disabled={processing}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-70"
        >
          {processing ? "Cancelling..." : "Confirm Cancel"}
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default TransactionCancel;
