import React, { useState } from "react";

import { confirmReceipt, postTransactionRating } from "../../services/api";

export const ReceiptStep = ({
  tx,
  isWinner,
  onRefresh,
  onError,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await confirmReceipt(tx.id);
      onSuccess("Transaction completed!");
      onRefresh();
    } catch (err) {
      onError(err.response?.data?.message || "Failed to confirm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <strong>3. Buyer confirms receipt</strong>
        <div className="text-xs text-gray-500">
          Status:{" "}
          {tx.status === "PendingReceipt"
            ? "Waiting"
            : tx.status === "Completed"
              ? "Done"
              : "Pending"}
        </div>
      </div>
      {tx.status === "PendingReceipt" && isWinner && (
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="bg-primary text-white px-3 py-1.5 rounded text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Confirming..." : "Confirm Receipt"}
        </button>
      )}
    </div>
  );
};

export const RatingStep = ({ tx, user, onRefresh, onError, onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const myRating = tx.ratings?.find((r) => r.rater_id === user?.id);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await postTransactionRating(tx.id, { score, comment });
      onSuccess("Rating submitted successfully");
      onRefresh();
      setShowForm(false);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to rate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-2">
        <strong>4. Rate transaction</strong>
        <div className="text-xs text-gray-500">Final step for both parties</div>
      </div>

      {tx.status === "Completed" && (
        <div className="ml-4">
          {myRating && !showForm ? (
            <div className="p-3 bg-gray-50 border rounded-lg inline-block">
              <span className="text-sm font-semibold text-gray-700">
                You rated:{" "}
              </span>
              <span
                className={`text-sm font-bold ${myRating.score === "Positive" ? "text-green-600" : "text-red-600"}`}
              >
                {myRating.score}
              </span>
              {myRating.comment && (
                <p className="text-sm text-gray-600 mt-1">
                  "{myRating.comment}"
                </p>
              )}
              <div className="mt-2">
                <button
                  onClick={() => {
                    setScore(myRating.score);
                    setComment(myRating.comment || "");
                    setShowForm(true);
                  }}
                  className="text-xs text-primary hover:text-primary/80 font-medium underline"
                >
                  Edit Rating
                </button>
              </div>
            </div>
          ) : !showForm ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForm(true);
                  setScore("Positive");
                }}
                className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
              >
                + Positive
              </button>
              <button
                onClick={() => {
                  setShowForm(true);
                  setScore("Negative");
                }}
                className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
              >
                - Negative
              </button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-white max-w-md shadow-sm">
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ratingScore"
                    value="Positive"
                    checked={score === "Positive"}
                    onChange={(e) => setScore(e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-green-700">
                    Positive
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ratingScore"
                    value="Negative"
                    checked={score === "Negative"}
                    onChange={(e) => setScore(e.target.value)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-red-700">
                    Negative
                  </span>
                </label>
              </div>
              <textarea
                className="w-full border p-2 rounded text-sm mb-3"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-primary text-white px-3 py-1.5 rounded text-sm hover:bg-primary/90"
                >
                  {loading ? "Saving..." : "Save Rating"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="border px-3 py-1.5 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
