import { React, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCategories } from "../hooks/useCategories";
import { useEditProduct } from "../hooks/useEditProduct";
import Spinner from "../components/common/Spinner";
import ProductForm from "../components/products/ProductForm";
import Button from "../components/common/Button";

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
      // Adjust for timezone offset to show correct local time in input
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      formattedTime = localDate.toISOString().slice(0, 16);
    }

    return {
      id: product.id,
      name: product.name,
      // Description để trống để người dùng nhập nội dung mới (append)
      description: "",
      startPrice: product.startPrice,
      stepPrice: product.stepPrice,
      buyNowPrice: product.buyNowPrice,
      categoryId: product.categoryId,
      endTime: formattedTime,
      autoRenew: product.autoRenew,
      allowUnratedBidders: product.allowUnratedBidders,
      allowLowRatingBidders: product.allowLowRatingBidders,
      images: product.images || [],
    };
  }, [product]);

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center text-red-500 mt-10">Error: {loadError}</div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#01AA85]">Edit Product</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/profile?tab=my-products")}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </Button>
      </div>

      <ProductForm
        initialValues={initialValues}
        categories={allCategories}
        onSubmit={updateProduct}
        loading={updating}
        showDescription={true}
        submitLabel="Update Product"
        isEditMode={true}
        hasBids={product?.bidCount > 0}
      />
    </div>
  );
}
