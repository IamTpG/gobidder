import React, { useState, useEffect } from "react";

import { uploadPayment } from "../../services/api";

const PaymentStep = ({ tx, isWinner, onRefresh, onError, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [address, setAddress] = useState("");
  const [uploading, setUploading] = useState(false);

  // Cleanup preview URL
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleUpload = async () => {
    try {
      setUploading(true);
      const form = new FormData();
      if (file) form.append("invoice", file);
      form.append("shipping_address", address);

      await uploadPayment(tx.id, form);
      onSuccess("Payment proof uploaded successfully.");
      onRefresh();
    } catch (err) {
      onError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isPending = tx.status === "PendingPayment";
  //   const isDone = tx.status !== "PendingPayment"; // Đã qua bước này

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <strong>1. Buyer provides payment proof & shipping address</strong>
          <div className="text-xs text-gray-500">
            Status: {isPending ? "Waiting" : "Done"}
          </div>
        </div>
      </div>

      {/* Hiển thị Form nếu đang pending và là Winner */}
      {isPending && isWinner && (
        <div className="mt-3 p-4 bg-gray-50 rounded border border-gray-200">
          <label className="block text-xs font-medium mb-1">
            Payment proof (image)
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

          <label className="block text-xs font-medium mb-1">
            Shipping address
          </label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter full address..."
          />

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !address}
            className="mt-3 bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Submit Payment Proof"}
          </button>
        </div>
      )}

      {/* Hiển thị kết quả nếu đã upload */}
      {tx.payment_invoice_url && (
        <div className="mt-3 ml-4">
          <p className="text-xs text-gray-500 mb-1">Uploaded proof:</p>
          <a href={tx.payment_invoice_url} target="_blank" rel="noreferrer">
            <img
              src={tx.payment_invoice_url}
              alt="Proof"
              className="h-24 rounded border hover:opacity-80 transition"
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;
