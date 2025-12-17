import React, { useState, useEffect } from "react";

import Button from "../common/Button";
import Spinner from "../common/Spinner";
import ConfirmDialog from "../common/ConfirmDialog";
import {
  formatPrice,
  validatePriceInput,
  parseFormattedPrice,
} from "../../utils/priceUtils";

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
  const [validationError, setValidationError] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const minBid = currentBid > 0 ? currentBid + minBidIncrement : startPrice;

  // Sync display value with bidAmount prop
  useEffect(() => {
    if (bidAmount === 0 || bidAmount === "") {
      setDisplayValue("");
    } else {
      setDisplayValue(formatPrice(bidAmount));
    }
  }, [bidAmount]);

  const handleBidInputChange = (inputValue) => {
    // Remove non-numeric characters except decimal point
    let cleanValue = inputValue.replace(/[^0-9.]/g, "");

    // Remove leading zeros but keep "0." for decimals
    if (
      cleanValue.length > 1 &&
      cleanValue[0] === "0" &&
      cleanValue[1] !== "."
    ) {
      cleanValue = cleanValue.replace(/^0+/, "");
    }

    // Prevent multiple decimal points
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Validate decimal places
    const validation = validatePriceInput(cleanValue);

    if (!validation.isValid) {
      setValidationError(validation.errorMessage);
      return; // Don't update if invalid
    } else {
      setValidationError("");
    }

    // Update display value with formatting
    if (cleanValue === "" || cleanValue === ".") {
      setDisplayValue(cleanValue);
      onBidChange(0);
    } else {
      const numValue = parseFloat(cleanValue);
      if (!isNaN(numValue)) {
        // Only format if not currently typing decimals
        if (cleanValue.endsWith(".") || cleanValue.match(/\.\d{0,2}$/)) {
          setDisplayValue(cleanValue);
        } else {
          setDisplayValue(formatPrice(numValue));
        }
        onBidChange(numValue);
      }
    }
  };

  const handleFocus = (e) => {
    // On focus, show the raw number for easier editing
    if (bidAmount && bidAmount !== 0) {
      setDisplayValue(String(bidAmount));
    }
  };

  const handleBlur = () => {
    // On blur, format the number
    if (bidAmount && bidAmount !== 0) {
      setDisplayValue(formatPrice(bidAmount));
    } else {
      setDisplayValue("");
    }
  };

  const handleBidClick = () => {
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmBid = () => {
    setShowConfirmDialog(false);
    onBid();
  };

  const handleCancelBid = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelBid}
        onConfirm={handleConfirmBid}
        title="Confirm Bid"
        message={`Are you sure you want to place a bid of $${formatPrice(bidAmount)}?`}
        confirmText="Place Bid"
        cancelText="Cancel"
        confirmVariant="primary"
        isLoading={isBidding}
      />

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Minimum bid:</span>
            <span className="font-medium text-gray-900">
              ${formatPrice(minBid)}
            </span>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={(e) => handleBidInputChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#00B289] focus:ring-0 font-semibold text-gray-900 transition-colors"
                placeholder="Enter amount"
                disabled={disabled}
              />
            </div>

            <Button
              onClick={handleBidClick}
              disabled={
                disabled || bidAmount < minBid || validationError !== ""
              }
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

          {/* Validation Error Message */}
          {validationError && (
            <p className="text-red-500 text-xs mt-1">{validationError}</p>
          )}

          {/* Các nút gợi ý nhanh (Quick bid buttons) */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              minBid,
              minBid + minBidIncrement,
              minBid + minBidIncrement * 2,
            ].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setValidationError("");
                  onBidChange(amount);
                }}
                disabled={disabled}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors whitespace-nowrap"
              >
                ${formatPrice(amount)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BidControls;
