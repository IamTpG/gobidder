import React from "react";

import Button from "../common/Button";
import Spinner from "../common/Spinner";

const BidControls = ({
  currentBid,
  startPrice,
  bidAmount,
  onBidChange,
  onBid,
  minBidIncrement,
  disabled = false,
  isBidding = false,
  label = "Place Bid",
}) => {
  const minBid = currentBid > 0 ? currentBid + minBidIncrement : startPrice;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Minimum bid:</span>
          <span className="font-medium text-gray-900">
            ${minBid.toLocaleString()}
          </span>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(val)) {
                  onBidChange(val);
                }
              }}
              className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#00B289] focus:ring-0 font-semibold text-gray-900 transition-colors"
              placeholder="Enter amount"
              min={minBid}
              disabled={disabled}
            />
          </div>

          <Button
            onClick={onBid}
            disabled={disabled || bidAmount < minBid}
            variant="primary"
            className="px-6 whitespace-nowrap"
          >
            {isBidding ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" className="text-white" />
                <span>Bidding...</span>
              </div>
            ) : (
              label
            )}
          </Button>
        </div>

        {/* Các nút gợi ý nhanh (Quick bid buttons) */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[minBid, minBid + minBidIncrement, minBid + minBidIncrement * 2].map(
            (amount) => (
              <button
                key={amount}
                onClick={() => onBidChange(amount)}
                disabled={disabled}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors whitespace-nowrap"
              >
                ${amount.toLocaleString()}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BidControls;
