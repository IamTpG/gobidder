import { useState, useEffect } from "react";
// Description editing removed from this page — append-only via Profile
import { useNavigate, useParams } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useEditProduct } from "../hooks/useEditProduct";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

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

  const [name, setName] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [stepPrice, setStepPrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [endTime, setEndTime] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [errors, setErrors] = useState({});

  // Populate form khi product được load
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setStartPrice(product.startPrice?.toString() || "");
      setStepPrice(product.stepPrice?.toString() || "");
      setBuyNowPrice(product.buyNowPrice?.toString() || "");
      setCategoryId(product.category?.id?.toString() || "");
      setAutoRenew(product.autoRenew || false);

      // Format endTime cho datetime-local input
      if (product.auctionEndDate) {
        const date = new Date(product.auctionEndDate);
        const localDateTime = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16);
        setEndTime(localDateTime);
      }

      // Set images
      if (product.images && Array.isArray(product.images)) {
        setImages(product.images);
      }
    }
  }, [product]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    if (!categoryId) newErrors.categoryId = "Please select a category";
    if (!endTime) newErrors.endTime = "Please choose an end time";
    if (new Date(endTime) <= new Date())
      newErrors.endTime = "End time must be in the future";

    if (images.length < 3) newErrors.images = "At least 3 images are required";

    if (!startPrice || Number(startPrice) <= 0)
      newErrors.startPrice = "Start price must be greater than 0";

    if (!stepPrice || Number(stepPrice) <= 0)
      newErrors.stepPrice = "Step price must be greater than 0";

    if (buyNowPrice && Number(buyNowPrice) <= 0)
      newErrors.buyNowPrice = "Buy now price must be greater than 0";

    if (buyNowPrice && Number(buyNowPrice) <= Number(startPrice))
      newErrors.buyNowPrice = "Buy now price must be greater than start price";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddImageByUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const handleImages = (e) => {
    const files = [...e.target.files];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        name,
        description: product.description || "", // Include existing description to satisfy backend validation
        images,
        startPrice: Number(startPrice),
        stepPrice: Number(stepPrice),
        buyNowPrice: buyNowPrice ? Number(buyNowPrice) : null,
        categoryId: Number(categoryId),
        endTime: new Date(endTime).toISOString(),
        autoRenew,
      };

      await updateProduct(payload);
      navigate(`/products/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loadingProduct) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Spinner size="lg" className="text-primary" />
        </div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <Button onClick={() => navigate("/profile?tab=my-products")}>
              Back to My Products
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="p-6 max-w-3xl mx-auto space-y-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/profile?tab=my-products")}
            >
              Cancel
            </Button>
          </div>

          {/* NAME */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">-- Select Category --</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* PRICE INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Start Price
              </label>
              <input
                type="number"
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
              />
              {errors.startPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.startPrice}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Step Price
              </label>
              <input
                type="number"
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={stepPrice}
                onChange={(e) => setStepPrice(e.target.value)}
              />
              {errors.stepPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.stepPrice}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Buy Now Price (optional)
              </label>
              <input
                type="number"
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={buyNowPrice}
                onChange={(e) => setBuyNowPrice(e.target.value)}
              />
              {errors.buyNowPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.buyNowPrice}
                </p>
              )}
            </div>
          </div>

          {/* IMAGE UPLOAD + URL */}
          <div className="space-y-3">
            <label className="block font-medium text-gray-700">
              Images (at least 3)
            </label>

            {/* URL input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste an image URL..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAddImageByUrl}
              >
                Add
              </Button>
            </div>

            {/* Local upload */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />

            {errors.images && (
              <p className="text-red-500 text-sm">{errors.images}</p>
            )}

            {/* Preview */}
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* END TIME */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
            )}
          </div>

          {/* AUTO RENEW */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label className="text-gray-700">Auto Renew</label>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            onClick={submit}
            disabled={updating}
          >
            {updating ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                Updating...
              </div>
            ) : (
              "Update Product"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
