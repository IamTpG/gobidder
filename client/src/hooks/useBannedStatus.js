import { useState, useEffect } from "react";
import api from "../services/api";

/**
 * Hook for checking if current user is banned from a product
 * @param {number} productId - Product ID to check
 * @param {boolean} enabled - Whether to execute the check
 * @returns {object} { isBanned, isLoading, error, refetch }
 */
const useBannedStatus = (productId, enabled = true) => {
  const [isBanned, setIsBanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkBannedStatus = async () => {
    if (!productId || !enabled) {
      setIsBanned(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/products/${productId}/banned-status`);
      setIsBanned(response.data?.isBanned || false);
    } catch (err) {
      // If unauthorized, user is not logged in - not banned
      if (err.response?.status === 401) {
        setIsBanned(false);
      } else {
        const errorMsg =
          err.response?.data?.message || "Failed to check banned status";
        setError(errorMsg);
        console.error("Error checking banned status:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBannedStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, enabled]);

  return {
    isBanned,
    isLoading,
    error,
    refetch: checkBannedStatus,
  };
};

export default useBannedStatus;
