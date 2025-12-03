import React from "react";
import { Link } from "react-router-dom";

const LargerIcon = () => {
  return (
    <svg
      className="w-4 h-4 mx-2 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
};

const ProductHeader = ({ product }) => {
  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-green-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
          {product.name}
        </h1>

        {/* Breadcrumb Navigation */}
        <nav className="flex justify-center items-center text-sm">
          <Link
            to="/"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Home
          </Link>

          <LargerIcon />

          <Link
            to="/products"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Products
          </Link>

          <LargerIcon />

          {product.categoryId && (
            <>
              <Link
                to={`/products?categoryId=${product.categoryId}`}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {product.category}
              </Link>

              <LargerIcon />
            </>
          )}

          <span className="text-gray-600 truncate max-w-md">
            {product.name}
          </span>
        </nav>
      </div>
    </div>
  );
};

export default ProductHeader;
