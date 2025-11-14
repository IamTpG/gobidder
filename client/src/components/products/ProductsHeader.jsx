import React from "react";

const ProductsHeader = ({ title = "All Auctions", subtitle }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};

export default ProductsHeader;
