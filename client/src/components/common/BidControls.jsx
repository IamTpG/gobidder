import React from 'react';
import Button from './Button';

const BidControls = ({ 
  currentBid,
  bidAmount, 
  onBidChange,
  onBid,
  minBidIncrement = 500,
  className = ''
}) => {
  const incrementBid = () => {
    onBidChange(bidAmount + minBidIncrement);
  };

  const decrementBid = () => {
    const newAmount = bidAmount - minBidIncrement;
    if (newAmount >= currentBid + minBidIncrement) {
      onBidChange(newAmount);
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-lg p-3 space-y-2.5 ${className}`}>
      {/* Bid Amount Display */}
      <div className="flex items-center justify-center gap-2.5">
        <button 
          onClick={decrementBid}
          disabled={bidAmount <= currentBid + minBidIncrement}
          className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg transition-colors duration-200 font-bold text-base text-gray-700"
        >
          −
        </button>
        
        <div className="flex-1 text-center">
          <input 
            type="text" 
            value={formatCurrency(bidAmount)}
            readOnly
            className="w-full text-lg font-bold text-gray-900 text-center bg-transparent border-none focus:outline-none cursor-default"
          />
          <p className="text-[9px] text-gray-500 mt-0">
            Minimum bid: {formatCurrency(currentBid + minBidIncrement)}
          </p>
        </div>
        
        <button 
          onClick={incrementBid}
          className="w-9 h-9 flex items-center justify-center bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200 font-bold text-base text-white shadow-sm hover:shadow-md"
        >
          +
        </button>
      </div>

      {/* Quick Bid Buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        {[500, 1000, 5000].map((amount) => (
          <button
            key={amount}
            onClick={() => onBidChange(bidAmount + amount)}
            className="px-2 py-1 text-[10px] font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200"
          >
            +{formatCurrency(amount)}
          </button>
        ))}
      </div>
      
      {/* Place Bid Button */}
      <Button 
        variant="primary" 
        size="md" 
        fullWidth
        onClick={onBid}
        className="text-sm font-semibold h-9 shadow-lg hover:shadow-xl"
      >
        Place Bid
      </Button>

      {/* Bid Info */}
      {/* <div className="text-center text-[9px] text-gray-500 pt-0.5 border-t border-gray-100">
        <p>By placing a bid, you agree to our terms and conditions</p>
      </div> */}
    </div>
  );
};

export default BidControls;
