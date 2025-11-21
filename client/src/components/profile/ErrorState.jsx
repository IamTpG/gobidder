import React from "react";

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
      <p className="text-lg font-semibold text-red-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
