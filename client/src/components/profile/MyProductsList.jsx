import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useSellerProducts,
  appendDescription,
} from "../../hooks/useEditProduct";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";
import Spinner from "../common/Spinner";
import Badge from "../common/Badge";
import Modal from "../common/Modal";

export default function MyProductsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading, error, refetch } = useSellerProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [descriptionText, setDescriptionText] = useState("");
  const [isAppending, setIsAppending] = useState(false);

  // Check if user is active Seller (not ExpiredSeller)
  const canCreateProducts = user?.role === "Seller";

  const handleOpenAppendModal = (productId) => {
    setSelectedProductId(productId);
    setDescriptionText("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
    setDescriptionText("");
  };

  const handleAppendDescription = async () => {
    if (!descriptionText.trim()) return;

    try {
      setIsAppending(true);
      await appendDescription(selectedProductId, descriptionText.trim());
      await refetch();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      // You might want to show a toast error here
      alert(err.response?.data?.message || "Failed to append description");
    } finally {
      setIsAppending(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status, bidCount) => {
    if (bidCount > 0) {
      return (
        <Badge variant="warning" size="sm">
          Has Bids
        </Badge>
      );
    }

    switch (status) {
      case "Active":
        return (
          <Badge variant="success" size="sm">
            Active
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="info" size="sm">
            Pending
          </Badge>
        );
      case "Sold":
        return (
          <Badge variant="primary" size="sm">
            Sold
          </Badge>
        );
      case "Expired":
        return (
          <Badge variant="danger" size="sm">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm">
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products yet
        </h3>
        <p className="text-gray-500 mb-6">
          You haven't created any products yet. Start by creating your first
          product!
        </p>
        {canCreateProducts && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/products/create")}
          >
            Create Product
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">My Products</h3>
        {canCreateProducts && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/products/create")}
          >
            + Create New
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={
                    product.images && product.images[0]
                      ? product.images[0]
                      : "https://via.placeholder.com/150"
                  }
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {product.category?.name || "Uncategorized"}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(product.status, product.bid_count)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Current Price</p>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(product.current_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Start Price</p>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(product.start_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bids</p>
                    <p className="font-semibold text-gray-900">
                      {product.bid_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ends</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(product.end_time)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenAppendModal(product.id)}
                  >
                    Append Description
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    View
                  </Button>

                  {product.bid_count === 0 && product.status === "Active" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      Edit
                    </Button>
                  )}
                  {product.bid_count > 0 && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Cannot edit (has bids)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Append Description"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAppendDescription}
              disabled={isAppending || !descriptionText.trim()}
              className="bg-[#01AA85] hover:bg-[#018f70] text-white"
            >
              {isAppending ? "Appending..." : "Append"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add new information to your product description. This will be
            appended to the existing description with today's date.
          </p>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01AA85] focus:border-transparent min-h-[150px]"
            placeholder="Enter additional description..."
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
