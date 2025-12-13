import React, { useState } from "react";
import { postTransactionRating } from "../../services/api";

const TransactionRating = ({ transaction, user, onRateSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [score, setScore] = useState("Positive");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!transaction || !user) return null;

  // Identify my role
  const isSeller = user.id === transaction.seller_id;
  const isWinner = user.id === transaction.winner_id;

  if (!isSeller && !isWinner) return null;

  // Find existing ratings
  const myRating = transaction.ratings?.find((r) => r.rater_id === user.id);
  const theirRating = transaction.ratings?.find((r) => r.rater_id !== user.id);

  const handleEditClick = () => {
    if (myRating) {
      setScore(myRating.score);
      setComment(myRating.comment || "");
    }
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!score) {
      setError("Please select a score (Positive/Negative).");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await postTransactionRating(transaction.id, { score, comment });
      setIsEditing(false);
      if (onRateSuccess) onRateSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingBadge = (s) => {
    const isPos = s === "Positive";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPos ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
      >
        {isPos ? "+ Positive" : "- Negative"}
      </span>
    );
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Transaction & Ratings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Helper Column: Who am I rating? */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              My Rating for {isSeller ? "Buyer" : "Seller"}
            </h4>

            {!isEditing && !myRating && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-3">
                  You haven't rated this transaction yet.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Rate Now
                </button>
              </div>
            )}

            {!isEditing && myRating && (
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  {renderRatingBadge(myRating.score)}
                  <button
                    onClick={handleEditClick}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Edit
                  </button>
                </div>
                {myRating.comment && (
                  <p className="text-sm text-gray-700 italic">
                    "{myRating.comment}"
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Posted on {new Date(myRating.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {isEditing && (
              <form
                onSubmit={handleSubmit}
                className="mt-2 bg-gray-50 p-4 rounded-md border border-primary/20"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="score"
                      value="Positive"
                      checked={score === "Positive"}
                      onChange={(e) => setScore(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Positive</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="score"
                      value="Negative"
                      checked={score === "Negative"}
                      onChange={(e) => setScore(e.target.value)}
                      className="text-red-600 focus:ring-red-600"
                    />
                    <span className="text-sm text-gray-700">Negative</span>
                  </label>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  rows={3}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Describe your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-primary hover:bg-primary/90 focus:outline-none disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Rating"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Their Rating */}
        <div className="space-y-4 border-t pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-8">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {isSeller ? "Buyer's" : "Seller's"} Rating
            </h4>
            {theirRating ? (
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <div className="mb-2">
                  {renderRatingBadge(theirRating.score)}
                </div>
                {theirRating.comment && (
                  <p className="text-sm text-gray-700 italic">
                    "{theirRating.comment}"
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Posted on{" "}
                  {new Date(theirRating.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500 italic">
                They haven't rated yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionRating;
