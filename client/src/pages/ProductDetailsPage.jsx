import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductDetails from "../components/ProductDetails";
import Spinner from "../components/common/Spinner";
import { getProductById } from "../services/api";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-br from-green-50 via-white to-green-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            {product.name}
          </h1>

          {/* Breadcrumb Navigation */}
          <nav className="flex justify-center items-center text-sm">
            <a
              href="/"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Home
            </a>
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
            <a
              href="/products"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Products
            </a>
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
            {product.category && (
              <>
                <span className="text-primary hover:text-primary/80 font-medium transition-colors">
                  {product.category}
                </span>
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
              </>
            )}
            <span className="text-gray-600 truncate max-w-md">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <ProductDetails product={product} />
    </div>
  );
};

export default ProductDetailsPage;
