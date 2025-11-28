import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from "react-router-dom";

import { useCategories } from "../hooks/useCategories";
import api from "../services/api";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function CreateProductPage_EN() {
  const navigate = useNavigate();
  const { allCategories } = useCategories();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [stepPrice, setStepPrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [endTime, setEndTime] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [images, setImages] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!categoryId) newErrors.categoryId = "Please select a category";
    if (!endTime) newErrors.endTime = "Please choose an end time";
    if (new Date(endTime) <= new Date())
      newErrors.endTime = "End time must be in the future";

    if (filesToUpload.length < 3)
      newErrors.images =
        "At least 3 uploaded images are required";

    if (!startPrice || Number(startPrice) <= 0)
      newErrors.startPrice = "Start price must be greater than 0";

    if (!stepPrice || Number(stepPrice) <= 0)
      newErrors.stepPrice = "Step price must be greater than 0";

    if (buyNowPrice && Number(buyNowPrice) <= 0)
      newErrors.buyNowPrice = "Buy now price must be greater than 0";

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
    setFilesToUpload((prev) => [...prev, ...selectedFiles]);
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
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  };
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("startPrice", startPrice);
      formData.append("stepPrice", stepPrice);
      if (buyNowPrice) formData.append("buyNowPrice", buyNowPrice);
      formData.append("categoryId", categoryId);
      formData.append("endTime", new Date(endTime).toISOString());
      formData.append("autoRenew", autoRenew);
      filesToUpload.forEach((file) => {
        formData.append("images", file);
      });

      const res = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Product</h1>

      {/* NAME */}
      <div>
        <label className="font-medium">Product Name</label>
        <input
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="font-medium">Description</label>
        
        {/* --- TINYMCE EDITOR (Commented Out) --- */}
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
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>

      {/* CATEGORY */}
      <div>
        <label className="font-medium">Category</label>
        <select
          className="border p-2 w-full rounded"
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
          <p className="text-red-500 text-sm">{errors.categoryId}</p>
        )}
      </div>

      {/* PRICE INPUTS */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label>Start Price</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
          />
          {errors.startPrice && (
            <p className="text-red-500 text-sm">{errors.startPrice}</p>
          )}
        </div>

        <div>
          <label>Step Price</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            value={stepPrice}
            onChange={(e) => setStepPrice(e.target.value)}
          />
          {errors.stepPrice && (
            <p className="text-red-500 text-sm">{errors.stepPrice}</p>
          )}
        </div>

        <div>
          <label>Buy Now Price (optional)</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            value={buyNowPrice}
            onChange={(e) => setBuyNowPrice(e.target.value)}
          />
          {errors.buyNowPrice && (
            <p className="text-red-500 text-sm">{errors.buyNowPrice}</p>
          )}
        </div>
      </div>

      {/* IMAGE UPLOAD + URL */}
      <div className="space-y-3">
        <label className="font-medium">Images (at least 3)</label>

        {/* URL input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste an image URL..."
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            onClick={handleAddImageByUrl}
          >
            Add
          </Button>
        </div>

        {/* Local upload */}
        <input type="file" multiple accept="image/*" onChange={handleImages} />

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
                className="w-full h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* END TIME */}
      <div>
        <label>End Time</label>
        <input
          type="datetime-local"
          className="border p-2 w-full rounded"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        {errors.endTime && (
          <p className="text-red-500 text-sm">{errors.endTime}</p>
        )}
      </div>

      {/* AUTO RENEW */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={autoRenew}
          onChange={(e) => setAutoRenew(e.target.checked)}
        />
        <label>Auto Renew</label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        onClick={submit}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner size="sm" className="text-white" />
            Creating...
          </div>
        ) : (
          "Create Product"
        )}
      </Button>
    </div>
  );
}
