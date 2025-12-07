import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's watchlist
  const fetchWatchlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/watchlist");
      setWatchlist(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching watchlist");
      console.error("Error fetching watchlist:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Check if a product is in watchlist
  const isInWatchlist = useCallback(
    (productId) => {
      return watchlist.some((product) => product.id === productId);
    },
    [watchlist]
  );

  // Toggle watchlist status
  const toggleWatchlist = useCallback(
    async (productId) => {
      try {
        const response = await api.post(`/watchlist/${productId}/toggle`);
        
        // Update local state
        if (response.data.isInWatchlist) {
          // Added to watchlist - refetch to get full product data
          await fetchWatchlist();
        } else {
          // Removed from watchlist
          setWatchlist((prev) => prev.filter((p) => p.id !== productId));
        }

        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error toggling watchlist";
        setError(errorMessage);
        console.error("Error toggling watchlist:", err);
        throw new Error(errorMessage);
      }
    },
    [fetchWatchlist]
  );

  // Add to watchlist
  const addToWatchlist = useCallback(
    async (productId) => {
      try {
        const response = await api.post(`/watchlist/${productId}`);
        await fetchWatchlist(); // Refresh watchlist
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error adding to watchlist";
        setError(errorMessage);
        console.error("Error adding to watchlist:", err);
        throw new Error(errorMessage);
      }
    },
    [fetchWatchlist]
  );

  // Remove from watchlist
  const removeFromWatchlist = useCallback(
    async (productId) => {
      try {
        const response = await api.delete(`/watchlist/${productId}`);
        setWatchlist((prev) => prev.filter((p) => p.id !== productId));
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error removing from watchlist";
        setError(errorMessage);
        console.error("Error removing from watchlist:", err);
        throw new Error(errorMessage);
      }
    },
    []
  );

  return {
    watchlist,
    isLoading,
    error,
    isInWatchlist,
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    refetch: fetchWatchlist,
  };
};
