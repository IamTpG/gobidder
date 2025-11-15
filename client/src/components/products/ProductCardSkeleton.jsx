import React from "react";

const ProductCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-slate-200 bg-slate-100 h-[420px]"
        />
      ))}
    </div>
  );
};

export default ProductCardSkeleton;
