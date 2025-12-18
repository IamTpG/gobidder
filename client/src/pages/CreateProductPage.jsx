import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCategories } from "../hooks/useCategories";
import api from "../services/api";
import ProductForm from "../components/products/ProductForm";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { allCategories } = useCategories();
  const [loading, setLoading] = useState(false);

  // Xử lý logic submit riêng của trang Create
  const handleCreateSubmit = async (formData) => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("startPrice", formData.startPrice);
      data.append("stepPrice", formData.stepPrice);
      if (formData.buyNowPrice)
        data.append("buyNowPrice", formData.buyNowPrice);
      data.append("categoryId", formData.categoryId);
      data.append("endTime", new Date(formData.endTime).toISOString());
      data.append("autoRenew", formData.autoRenew);
      data.append("allowNoRatingBid", formData.allowNoRatingBid);
      data.append("allowLowRatingBid", formData.allowLowRatingBid);

      // Quan trọng: Append file gốc vào FormData
      formData.filesToUpload.forEach((file) => {
        data.append("images", file);
      });

      const res = await api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/products/${res.data.product.id}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md my-8">
      <h1 className="text-2xl font-bold mb-6">Create Product</h1>
      <ProductForm
        categories={allCategories}
        onSubmit={handleCreateSubmit}
        loading={loading}
        showDescription={true} // Bật description cho trang Create
        submitLabel="Create Product"
      />
    </div>
  );
}
