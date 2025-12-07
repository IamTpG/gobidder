import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export const useEditProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const updateProduct = async (formData) => {
    setUpdating(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);

      // Only append description if it has value (new info)
      if (formData.description) {
        data.append("description", formData.description);
      }

      data.append("startPrice", formData.startPrice);
      data.append("stepPrice", formData.stepPrice);
      if (formData.buyNowPrice)
        data.append("buyNowPrice", formData.buyNowPrice);
      data.append("categoryId", formData.categoryId);
      data.append("endTime", new Date(formData.endTime).toISOString());
      data.append("autoRenew", formData.autoRenew);

      // Handle images
      // formData.images contains all current images (URLs and base64 previews)
      // formData.filesToUpload contains new File objects

      // 1. Filter old images (URLs)
      const oldImages = formData.images.filter(
        (img) => typeof img === "string" && !img.startsWith("data:"),
      );
      oldImages.forEach((url) => data.append("oldImages", url));

      // 2. Append new files
      if (formData.filesToUpload && formData.filesToUpload.length > 0) {
        formData.filesToUpload.forEach((file) => {
          data.append("images", file);
        });
      }

      const res = await api.put(`/products/${productId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/products/${productId}`);
    } catch (err) {
      console.error("Error updating product:", err);
      alert(err.response?.data?.message || "Failed to update product");
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
