import React, { useState, useEffect } from "react";

import { uploadShipping } from "../../services/api";

const ShippingStep = ({ tx, isSeller, onRefresh, onError, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleUpload = async () => {
    try {
      setUploading(true);
      const form = new FormData();
      if (file) form.append("invoice", file);

      await uploadShipping(tx.id, form);
      onSuccess("Shipping proof uploaded successfully.");
      onRefresh();
    } catch (err) {
      onError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isPending = tx.status === "PendingShipping";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <strong>2. Seller confirms payment & uploads shipping invoice</strong>
          <div className="text-xs text-gray-500">
            Status:{" "}
            {isPending
              ? "Waiting"
              : ["PendingReceipt", "Completed"].includes(tx.status)
                ? "Done"
                : "Pending"}
          </div>
        </div>
      </div>

      {isPending && isSeller && (
        <div className="mt-3 p-4 bg-gray-50 rounded border border-gray-200">
          <label className="block text-xs font-medium mb-1">
            Shipping proof (image)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files[0];
              setFile(f);
              if (f) setPreview(URL.createObjectURL(f));
            }}
            className="text-sm mb-2"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-32 object-cover rounded border mb-2"
            />
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="mt-2 bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Confirm & Upload"}
          </button>
        </div>
      )}

      {tx.shipping_invoice_url && (
        <div className="mt-3 ml-4">
          <p className="text-xs text-gray-500 mb-1">Shipping proof:</p>
          <a href={tx.shipping_invoice_url} target="_blank" rel="noreferrer">
            <img
              src={tx.shipping_invoice_url}
              alt="Shipping Proof"
              className="h-24 rounded border hover:opacity-80 transition"
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default ShippingStep;
