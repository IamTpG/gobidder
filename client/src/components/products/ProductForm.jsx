// components/products/ProductForm.jsx
import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";

import Button from "../common/Button";
import Spinner from "../common/Spinner";
import { validatePriceInput } from "../../utils/priceUtils";

export default function ProductForm({
  initialValues = {},
  categories = [],
  onSubmit,
  loading = false,
  showDescription = false,
  submitLabel = "Submit",
  isEditMode = false,
}) {
  // Khởi tạo state dựa trên initialValues (cho Edit) hoặc mặc định (cho Create)
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(
    initialValues.description || ""
  );
  const [startPrice, setStartPrice] = useState(initialValues.startPrice || "");
  const [stepPrice, setStepPrice] = useState(initialValues.stepPrice || "");
  const [buyNowPrice, setBuyNowPrice] = useState(
    initialValues.buyNowPrice || ""
  );
  const [categoryId, setCategoryId] = useState(initialValues.categoryId || "");
  const [endTime, setEndTime] = useState(initialValues.endTime || "");
  const [autoRenew, setAutoRenew] = useState(initialValues.autoRenew || false);
  const [allowNoRatingBid, setAllowNoRatingBid] = useState(
    initialValues.allowNoRatingBid ?? true
  );

  // Image handling
  const [images, setImages] = useState(initialValues.images || []);
  const [filesToUpload, setFilesToUpload] = useState([]); // Dùng riêng cho Create (FormData)
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [fileLabel, setFileLabel] = useState("No files selected");

  const [errors, setErrors] = useState({});
  const [priceErrors, setPriceErrors] = useState({
    startPrice: "",
    stepPrice: "",
    buyNowPrice: "",
  });

  // Cập nhật form khi initialValues thay đổi (quan trọng cho EditPage khi data load chậm)
  useEffect(() => {
    if (initialValues.id) {
      setName(initialValues.name || "");
      setStartPrice(initialValues.startPrice || "");
      setStepPrice(initialValues.stepPrice || "");
      setBuyNowPrice(initialValues.buyNowPrice || "");
      setCategoryId(initialValues.categoryId || "");
      setEndTime(initialValues.endTime || "");
      setAutoRenew(initialValues.autoRenew || false);
      setImages(initialValues.images || []);
      // Description thường không update lại trong Edit theo yêu cầu của bạn, nhưng nếu cần thì thêm vào đây
    }
  }, [initialValues]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    if (showDescription && !isEditMode && !description.trim())
      newErrors.description = "Description is required";
    if (!categoryId) newErrors.categoryId = "Please select a category";

    if (!endTime) newErrors.endTime = "Please choose an end time";
    else if (new Date(endTime) <= new Date())
      newErrors.endTime = "End time must be in the future";

    if (images.length < 3) newErrors.images = "At least 3 images are required";

    if (!startPrice || Number(startPrice) <= 0)
      newErrors.startPrice = "Start price > 0";
    if (!stepPrice || Number(stepPrice) <= 0)
      newErrors.stepPrice = "Step price > 0";
    if (buyNowPrice && Number(buyNowPrice) <= 0)
      newErrors.buyNowPrice = "Buy now price > 0";
    if (buyNowPrice && Number(buyNowPrice) <= Number(startPrice))
      newErrors.buyNowPrice = "Buy now price must be greater than start price";

    // Check for decimal validation errors
    if (
      priceErrors.startPrice ||
      priceErrors.stepPrice ||
      priceErrors.buyNowPrice
    ) {
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddImageByUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const handleImages = (e) => {
    const selectedFiles = [...e.target.files];
    // Lưu file gốc để CreatePage dùng
    setFilesToUpload((prev) => {
      const next = [...prev, ...selectedFiles];
      setFileLabel(
        next.length > 0
          ? `${next.length} file${next.length > 1 ? "s" : ""} selected`
          : "No files selected"
      );
      return next;
    });

    // Tạo preview base64/blob
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setFilesToUpload((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setFileLabel(
        next.length > 0
          ? `${next.length} file${next.length > 1 ? "s" : ""} selected`
          : "No files selected"
      );
      return next;
    });
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Gom dữ liệu trả về cho Parent Component
    const formData = {
      name,
      description,
      startPrice,
      stepPrice,
      buyNowPrice,
      categoryId,
      endTime,
      autoRenew,
      allowNoRatingBid,
      images, // Dùng cho Edit (JSON payload)
      filesToUpload, // Dùng cho Create (Multipart form)
    };

    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Name */}
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

      {/* Description (Conditional Render) */}
      {showDescription && (
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            {isEditMode ? "Description (Optional)" : "Description"}
          </label>
          {isEditMode && (
            <p className="text-sm text-gray-500 mb-2">
              New information will be appended to the existing description.
            </p>
          )}
          <Editor
            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            init={{
              height: 300,
              menubar: false,
              plugins: "image link lists table code preview",
              toolbar:
                "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | image link | code",
            }}
            value={description}
            onEditorChange={(v) => setDescription(v)}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
      )}

      {/* Category */}
      <div>
        <label className="block font-medium text-gray-700 mb-2">Category</label>
        <select
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">-- Select Category --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
        )}
      </div>

      {/* Price Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Start Price
          </label>
          <input
            type="number"
            step="0.01"
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={startPrice}
            onChange={(e) => {
              const value = e.target.value;
              setStartPrice(value);
              const validation = validatePriceInput(value);
              setPriceErrors((prev) => ({
                ...prev,
                startPrice: validation.errorMessage,
              }));
            }}
          />
          {priceErrors.startPrice && (
            <p className="text-red-500 text-sm mt-1">
              {priceErrors.startPrice}
            </p>
          )}
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
            step="0.01"
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={stepPrice}
            onChange={(e) => {
              const value = e.target.value;
              setStepPrice(value);
              const validation = validatePriceInput(value);
              setPriceErrors((prev) => ({
                ...prev,
                stepPrice: validation.errorMessage,
              }));
            }}
          />
          {priceErrors.stepPrice && (
            <p className="text-red-500 text-sm mt-1">{priceErrors.stepPrice}</p>
          )}
          {errors.stepPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.stepPrice}</p>
          )}
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Buy Now Price (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={buyNowPrice}
            onChange={(e) => {
              const value = e.target.value;
              setBuyNowPrice(value);
              const validation = validatePriceInput(value);
              setPriceErrors((prev) => ({
                ...prev,
                buyNowPrice: validation.errorMessage,
              }));
            }}
          />
          {priceErrors.buyNowPrice && (
            <p className="text-red-500 text-sm mt-1">
              {priceErrors.buyNowPrice}
            </p>
          )}
          {errors.buyNowPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.buyNowPrice}</p>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">
          Images (at least 3)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste URL..."
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg flex-1"
          />
          <Button type="button" variant="primary" onClick={handleAddImageByUrl}>
            Add
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="product-file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImages}
            className="hidden"
          />
          <label
            htmlFor="product-file-input"
            className="cursor-pointer inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
          >
            Choose files
          </label>
          <span className="text-sm text-gray-600">{fileLabel}</span>
        </div>
        {errors.images && (
          <p className="text-red-500 text-sm">{errors.images}</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt=""
                className="w-full h-24 object-cover rounded-lg border"
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

      {/* Time & Auto Renew */}
      <div>
        <label className="block font-medium text-gray-700 mb-2">End Time</label>
        <input
          type="datetime-local"
          className="border border-gray-300 p-3 w-full rounded-lg"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        {errors.endTime && (
          <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={autoRenew}
          onChange={(e) => setAutoRenew(e.target.checked)}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label className="text-gray-700">Auto Renew</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={allowNoRatingBid}
          onChange={(e) => setAllowNoRatingBid(e.target.checked)}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label className="text-gray-700">Allow bidders with no rating</label>
      </div>

      {/* Submit */}
      <Button
        type="button"
        variant="primary"
        size="md"
        fullWidth
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner size="sm" className="text-white" />
            Processing...
          </div>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
