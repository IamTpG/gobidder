import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";

// Import Components
import ProductDetails from "../components/product-details/ProductDetails";
import ProductHeader from "../components/product-details/ProductHeader";
import Spinner from "../components/common/Spinner";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State quản lý data & UI
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetchProduct = () => setRefreshTrigger((prev) => prev + 1);

  // Fetch Logic
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getProductById(id);
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, refreshTrigger]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {error ? "Something went wrong" : "Product Not Found"}
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "The product you are looking for does not exist."}
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Success State
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Dynamic Header with Breadcrumb */}
      <ProductHeader product={product} />

      {/* Main Content */}
      <ProductDetails product={product} onRefresh={refetchProduct} />
    </div>
  );
};

export default ProductDetailsPage;
