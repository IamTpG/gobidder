import { useState } from "react";
import api from "../services/api";

/**
 * Hook for banning a bidder from a product
 * @returns {object} { banBidder, isLoading, error, success }
 */
const useBanBidder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const banBidder = async ({ productId, bidderId }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post(`/products/${productId}/ban-bidder`, {
        bidderId,
      });

      setSuccess(response.data?.message || "Bidder banned successfully");
      return response.data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to ban bidder. Please try again.";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    banBidder,
    isLoading,
    error,
    success,
    resetState,
  };
};

export default useBanBidder;
