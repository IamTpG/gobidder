import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TabNavigation from "../../components/common/TabNavigation";
import { ConfirmDialog } from "../../components/common";
import CategoryManagement from "../../components/admin/CategoryManagement";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { useCategories } from "../../hooks/useCategories";
import {
  ProductsSidebar,
  ProductsToolbar,
  ProductCardSkeleton,
  EmptyState,
  ErrorState,
} from "../../components/products";
import Pagination from "../../shared/Pagination";
import api from "../../services/api";

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    startResult,
    endResult,
    status,
    sort,
    q,
    categoryId,
    handlePageChange,
    handleStatusChange,
    handleSortChange,
    handleSearchChange,
    handleCategoryChange,
    refetch,
  } = useAdminProducts();

  const [notification, setNotification] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    productId: null,
    productName: "",
  });

  // Fetch categories
  const {
    categories,
    allCategories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  const [activeSection, setActiveSection] = useState("products"); // "products" or "categories"

  const tabs = [
    { key: "All", label: "All Products" },
    { key: "Active", label: "Active" },
    { key: "Sold", label: "Sold" },
    { key: "Expired", label: "Expired" },
    { key: "Removed", label: "Removed" },
  ];

  const handleDeleteClick = (productId, productName) => {
    setConfirmDialog({
      isOpen: true,
      productId,
      productName,
    });
  };

  const handleDeleteConfirm = async () => {
    const { productId } = confirmDialog;
    setConfirmDialog({ isOpen: false, productId: null, productName: "" });
    setDeletingId(productId);
    try {
      await api.delete(`/products/admin/${productId}`);
      setNotification({
        type: "success",
        message: "Product removed successfully!",
      });
      refetch();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to remove product",
      });
    } finally {
      setDeletingId(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, productId: null, productName: "" });
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "0.00";
    return numPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      Active: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Sold: "bg-blue-100 text-blue-800",
      Expired: "bg-gray-100 text-gray-800",
      Removed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          badges[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white">
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to remove "${confirmDialog.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deletingId === confirmDialog.productId}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col gap-6 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {activeSection === "categories" ? (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Category Management
                </h1>
                <p className="text-sm text-gray-600">
                  View, edit, and manage all categories in the system
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Product Management
                </h1>
                <p className="text-sm text-gray-600">
                  View, edit, and manage all products in the system
                </p>
              </div>
            )}
            {/* Section Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setActiveSection("products")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeSection === "products"
                    ? "bg-white text-[#00B289] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveSection("categories")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeSection === "categories"
                    ? "bg-white text-[#00B289] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Categories
              </button>
            </div>
          </div>

          {notification && (
            <div
              className={`p-4 rounded-lg ${
                notification.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{notification.message}</span>
                <button
                  onClick={() => setNotification(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Content based on active section */}
          {activeSection === "categories" ? (
            <CategoryManagement
              categories={categories}
              allCategories={allCategories}
              onUpdate={refetchCategories}
            />
          ) : (
            <>
              {/* Status Filter Tabs */}
              <div className="mb-4">
                <div className="flex justify-end">
                  <TabNavigation
                    tabs={tabs}
                    activeTab={status}
                    onChange={handleStatusChange}
                    variant="pills"
                    className="overflow-x-auto"
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                <ProductsSidebar
                  searchValue={q}
                  onSearchChange={handleSearchChange}
                  categories={categories}
                  isLoadingCategories={categoriesLoading}
                  selectedCategoryId={categoryId}
                  onCategoryChange={handleCategoryChange}
                  className="lg:w-56 w-full"
                />

                <section className="flex-1 min-w-0">
                  <ProductsToolbar
                    startResult={startResult}
                    endResult={endResult}
                    totalItems={totalItems}
                    sort={sort}
                    onSortChange={handleSortChange}
                  />

                  {isLoading && <ProductCardSkeleton count={6} />}

                  {!isLoading && error && <ErrorState message={error} />}

                  {!isLoading && !error && products.length === 0 && (
                    <EmptyState
                      title="No products found"
                      message={
                        status && status !== "All"
                          ? `No ${status.toLowerCase()} products found.`
                          : "No products found matching your criteria."
                      }
                    />
                  )}

                  {!isLoading && !error && products.length > 0 && (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block">
                        <table className="w-full text-left border-collapse table-auto">
                          <thead>
                            <tr className="border-b border-gray-200 text-gray-600 text-sm">
                              <th className="py-3 px-2 sm:px-4 font-medium">
                                Product
                              </th>
                              <th className="py-3 px-2 sm:px-4 font-medium whitespace-nowrap">
                                Current Price
                              </th>
                              <th className="py-3 px-2 sm:px-4 font-medium whitespace-nowrap">
                                Bids
                              </th>
                              <th className="py-3 px-2 sm:px-4 font-medium whitespace-nowrap">
                                End Time
                              </th>
                              <th className="py-3 px-2 sm:px-4 font-medium whitespace-nowrap">
                                Status
                              </th>
                              <th className="py-3 px-2 sm:px-4 font-medium text-right whitespace-nowrap">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {products.map((product) => {
                              const images = Array.isArray(product.images)
                                ? product.images
                                : typeof product.images === "string"
                                  ? JSON.parse(product.images)
                                  : [];
                              const imageUrl = images[0] || "";

                              return (
                                <tr
                                  key={product.id}
                                  onClick={() =>
                                    navigate(`/products/${product.id}`)
                                  }
                                  className="hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group"
                                >
                                  <td className="py-4 px-2 sm:px-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 line-clamp-2 break-words text-sm sm:text-base">
                                          {product.name}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-500 line-clamp-1 break-words">
                                          {product.category?.name ||
                                            "Uncategorized"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-2 sm:px-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900 text-sm sm:text-base">
                                      $
                                      {formatPrice(
                                        product.current_price ||
                                          product.start_price,
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 px-2 sm:px-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">
                                      {product.bid_count || 0}
                                    </span>
                                  </td>
                                  <td className="py-4 px-2 sm:px-4 whitespace-nowrap">
                                    <div className="text-xs sm:text-sm text-gray-900">
                                      {formatDate(product.end_time)}
                                    </div>
                                  </td>
                                  <td className="py-4 px-2 sm:px-4 whitespace-nowrap">
                                    {getStatusBadge(product.status)}
                                  </td>
                                  <td className="py-4 px-2 sm:px-4 text-right whitespace-nowrap">
                                    <div
                                      className="flex items-center gap-2 justify-end"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* View Button */}
                                      <button
                                        onClick={() =>
                                          navigate(`/products/${product.id}`)
                                        }
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors relative group/btn"
                                        title="View Product"
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                        </svg>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                          View
                                        </span>
                                      </button>

                                      {/* Edit Button */}
                                      <button
                                        onClick={() =>
                                          navigate(
                                            `/products/${product.id}/edit`,
                                          )
                                        }
                                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors relative group/btn"
                                        title="Edit Product"
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                          Edit
                                        </span>
                                      </button>

                                      {/* Delete Button - Chỉ hiển thị khi status không phải Removed */}
                                      {product.status !== "Removed" && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(
                                              product.id,
                                              product.name,
                                            );
                                          }}
                                          disabled={deletingId === product.id}
                                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative group/btn"
                                          title="Delete Product"
                                        >
                                          {deletingId === product.id ? (
                                            <svg
                                              className="w-5 h-5 animate-spin"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                              />
                                            </svg>
                                          ) : (
                                            <svg
                                              className="w-5 h-5"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                              />
                                            </svg>
                                          )}
                                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            Delete
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {products.map((product) => {
                          const images = Array.isArray(product.images)
                            ? product.images
                            : typeof product.images === "string"
                              ? JSON.parse(product.images)
                              : [];
                          const imageUrl = images[0] || "";

                          return (
                            <div
                              key={product.id}
                              onClick={() =>
                                navigate(`/products/${product.id}`)
                              }
                              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className="flex gap-3 mb-3">
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                                    {product.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 mb-2">
                                    {product.category?.name || "Uncategorized"}
                                  </p>
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusBadge(product.status)}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                <div>
                                  <span className="text-gray-500">Price:</span>
                                  <span className="font-medium text-gray-900 ml-1">
                                    $
                                    {formatPrice(
                                      product.current_price ||
                                        product.start_price,
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Bids:</span>
                                  <span className="font-medium text-gray-900 ml-1">
                                    {product.bid_count || 0}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-500">
                                    End Time:
                                  </span>
                                  <span className="font-medium text-gray-900 ml-1">
                                    {formatDate(product.end_time)}
                                  </span>
                                </div>
                              </div>
                              <div
                                className="flex items-center gap-2 pt-3 border-t border-gray-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    navigate(`/products/${product.id}`)
                                  }
                                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(`/products/${product.id}/edit`)
                                  }
                                  className="flex-1 px-3 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                >
                                  Edit
                                </button>
                                {product.status !== "Removed" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(
                                        product.id,
                                        product.name,
                                      );
                                    }}
                                    disabled={deletingId === product.id}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {deletingId === product.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-6">
                          <Pagination
                            page={currentPage}
                            totalPages={totalPages}
                            onChange={handlePageChange}
                          />
                        </div>
                      )}
                    </>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagementPage;
