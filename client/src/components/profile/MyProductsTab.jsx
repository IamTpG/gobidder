import React from "react";
import { useNavigate } from "react-router-dom";

import { useMyProducts } from "../../hooks/useMyProducts";
import { useAuth } from "../../contexts/AuthContext";
import {
  ProductGrid,
  ProductCardSkeleton,
  EmptyState,
  ErrorState,
  ProductsToolbar,
} from "../products";
import Pagination from "../../shared/Pagination";

const MyProductsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    startResult,
    endResult,
    sort,
    status,
    handlePageChange,
    handleSortChange,
    handleStatusChange,
  } = useMyProducts();

  // Check if user is active Seller (not ExpiredSeller)
  const canCreateProducts = user?.role === "Seller";

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
          <p className="text-sm text-gray-500">
            Manage your listed products and auctions.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => handleStatusChange(undefined)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              !status
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusChange("Active")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              status === "Active"
                ? "bg-white text-[#00B289] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleStatusChange("Pending")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              status === "Pending"
                ? "bg-white text-[#00B289] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusChange("Sold")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              status === "Sold"
                ? "bg-white text-[#00B289] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sold
          </button>
          <button
            onClick={() => handleStatusChange("Expired")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              status === "Expired"
                ? "bg-white text-[#00B289] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {!isLoading && !error && (
        <ProductsToolbar
          startResult={startResult}
          endResult={endResult}
          totalItems={totalItems}
          sort={sort}
          onSortChange={handleSortChange}
        />
      )}

      {/* Content Area */}
      {isLoading && <ProductCardSkeleton count={6} />}

      {!isLoading && error && <ErrorState message={error} />}

      {!isLoading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center">
          <EmptyState
            title="No products found"
            message={
              status
                ? `You don't have any ${status.toLowerCase()} products.`
                : "You haven't listed any products yet."
            }
          />
          {canCreateProducts && (
            <button
              onClick={() => navigate("/products/create")}
              className="bg-[#00B289] hover:bg-[#009974] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors mt-6"
            >
              Create New Auction
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          <ProductGrid products={products} />
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyProductsTab;
