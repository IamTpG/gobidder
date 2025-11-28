import { useState, useEffect } from "react";
import api from "../services/api";

/**
 * Hook để lấy thông tin sản phẩm và cập nhật sản phẩm
 */
export const useEditProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch product details
  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Update product
  const updateProduct = async (productData) => {
    try {
      setUpdating(true);
      setError(null);
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    } catch (err) {
      console.error("Error updating product:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to update product";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  return {
    product,
    loading,
    error,
    updating,
    updateProduct,
  };
};

/**
 * Hook để lấy danh sách sản phẩm của seller
 */
export const useSellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/products/seller/my-products");
      setProducts(response.data.data || []);
    } catch (err) {
      console.error("Error fetching seller products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};

/**
 * Append a description entry for a product (seller only)
 */
export const appendDescription = async (productId, text) => {
  if (!productId) throw new Error("Invalid product id");
  if (!text || !text.trim()) throw new Error("Description text is required");

  try {
    const response = await api.post(
      `/products/${productId}/append-description`,
      { text: text.trim() },
    );
    return response.data;
  } catch (err) {
    console.error("Error appending description:", err);
    throw err;
  }
};
