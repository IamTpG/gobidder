import React from "react";

const EmptyState = ({
  title = "No products found",
  message = "Try adjusting your filters or search keywords.",
}) => {
  return (
    <div className="mt-12 text-center text-slate-500">
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
};

export default EmptyState;
