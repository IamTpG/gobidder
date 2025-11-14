import React from "react";

const ErrorState = ({
  message = "An error occurred while fetching products.",
}) => {
  return (
    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
      {message}
    </div>
  );
};

export default ErrorState;
