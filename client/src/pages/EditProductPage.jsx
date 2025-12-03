import { React, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCategories } from "../hooks/useCategories";
import { useEditProduct } from "../hooks/useEditProduct";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import ProductForm from "../components/products/ProductForm";

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { allCategories } = useCategories();
  const {
    product,
    loading: loadingProduct,
    error: loadError,
    updating,
    updateProduct,
  } = useEditProduct(id);

  // Chuẩn bị initialValues từ product fetch được
  const initialValues = useMemo(() => {
    if (!product) return {};

    // Format ngày giờ cho input datetime-local
    let formattedTime = "";
    if (product.auctionEndDate) {
      const date = new Date(product.auctionEndDate);
      formattedTime = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
    }

    return {
      id: product.id,
      name: product.name,
      // Description không hiển thị ở UI nhưng có thể cần giữ lại giá trị cũ
      description: product.description,
      startPrice: product.startPrice,
      stepPrice: product.stepPrice,
      buyNowPrice: product.buyNowPrice,
      categoryId: product.category?.id,
      endTime: formattedTime,
      autoRenew: product.autoRenew,
      images: product.images || [],
    };
  }, [product]);

  const handleUpdateSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description || product.description, // Giữ nguyên description cũ
        images: formData.images, // Gửi mảng link ảnh/base64 (JSON payload)
        startPrice: Number(formData.startPrice),
        stepPrice: Number(formData.stepPrice),
        buyNowPrice: formData.buyNowPrice ? Number(formData.buyNowPrice) : null,
        categoryId: Number(formData.categoryId),
        endTime: new Date(formData.endTime).toISOString(),
        autoRenew: formData.autoRenew,
      };

      await updateProduct(payload);
      navigate(`/products/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <Button onClick={() => navigate("/profile?tab=my-products")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/profile?tab=my-products")}
          >
            Cancel
          </Button>
        </div>

        <ProductForm
          initialValues={initialValues}
          categories={allCategories}
          onSubmit={handleUpdateSubmit}
          loading={updating}
          showDescription={false} // Tắt description cho trang Edit
          submitLabel="Update Product"
        />
      </div>
    </div>
  );
}
