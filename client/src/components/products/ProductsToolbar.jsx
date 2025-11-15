import React from "react";

const ProductsToolbar = ({
  startResult,
  endResult,
  totalItems,
  sort,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <p className="text-sm text-slate-500">
        Showing {startResult}-{endResult} of {totalItems} Results
      </p>
      <div className="flex items-center gap-3">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          <option value="created_at">Default Sorting</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default ProductsToolbar;
