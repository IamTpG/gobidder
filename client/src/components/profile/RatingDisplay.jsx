import React from "react";

const RatingDisplay = ({ rating, small = false }) => {
  if (!rating || rating.total === 0) {
    return (
      <div
        className={`bg-gray-50 ${small ? "rounded-xl p-3" : "rounded-2xl p-5"} border border-gray-100`}
      >
        <p className={`${small ? "text-xs" : "text-sm"} text-gray-500 mb-1`}>
          Rating
        </p>
        <p className={`text-gray-900 font-medium ${small ? "text-sm" : ""}`}>
          No ratings yet
        </p>
      </div>
    );
  }

  const { positive, negative, total, score, difference } = rating;

  // Xác định màu sắc dựa trên score
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div
      className={`bg-gray-50 ${small ? "rounded-xl p-3" : "rounded-2xl p-5"} border border-gray-100 ${getScoreBgColor(score)}`}
    >
      {!small && (
        <p
          className={`${small ? "text-xs" : "text-sm"} text-gray-500 ${small ? "mb-2" : "mb-3"}`}
        >
          Rating Score
        </p>
      )}

      <div className={`flex items-baseline gap-2 ${small ? "mb-2" : "mb-3"}`}>
        <span
          className={`${small ? "text-2xl" : "text-3xl"} font-bold ${getScoreColor(score)}`}
        >
          {score}%
        </span>
        <span className={`${small ? "text-xs" : "text-sm"} text-gray-500`}>
          positive
        </span>
      </div>

      <div
        className={`flex ${small ? "flex-wrap" : ""} items-center ${small ? "gap-2" : "gap-4"} ${small ? "text-xs" : "text-sm"}`}
      >
        <div className="flex items-center gap-1">
          <span className="text-green-600 font-semibold">+{positive}</span>
          <span className="text-gray-500">{small ? "pos" : "positive"}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-red-600 font-semibold">-{negative}</span>
          <span className="text-gray-500">{small ? "neg" : "negative"}</span>
        </div>

        <div className="text-gray-500">
          ({total} {total === 1 ? "rating" : "ratings"})
        </div>
      </div>

      {difference !== 0 && (
        <div
          className={`${small ? "mt-1.5 pt-1.5" : "mt-2 pt-2"} border-t border-gray-200`}
        >
          <p className="text-xs text-gray-500">
            {small ? "Net:" : "Net rating:"}{" "}
            <span
              className={
                difference > 0
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {difference > 0 ? "+" : ""}
              {difference}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
