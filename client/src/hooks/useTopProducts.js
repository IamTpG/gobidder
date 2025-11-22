import { useState, useEffect } from "react";
import api from "../services/api";

/**
 * Hook để lấy Top 5 sản phẩm gần kết thúc
 */
export const useTopEndingSoon = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopEndingSoon = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/products/top/ending-soon");
        setProducts(response.data.data || []);
      } catch (err) {
        console.error("Error fetching top ending soon products:", err);
        setError(err.message || "Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopEndingSoon();
  }, []);

  return { products, isLoading, error };
};

/**
 * Hook để lấy Top 5 sản phẩm có nhiều lượt ra giá nhất
 */
export const useTopMostBids = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopMostBids = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/products/top/most-bids");
        setProducts(response.data.data || []);
      } catch (err) {
        console.error("Error fetching top most bids products:", err);
        setError(err.message || "Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMostBids();
  }, []);

  return { products, isLoading, error };
};

/**
 * Hook để lấy Top 5 sản phẩm có giá cao nhất
 */
export const useTopHighestPrice = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopHighestPrice = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/products/top/highest-price");
        setProducts(response.data.data || []);
      } catch (err) {
        console.error("Error fetching top highest price products:", err);
        setError(err.message || "Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopHighestPrice();
  }, []);

  return { products, isLoading, error };
};
