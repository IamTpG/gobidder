import { useEffect, useState } from "react";
import api from "../services/api";

const useRelatedProducts = (productId, limit = 5) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    const fetchRelated = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `/products/${productId}/related?limit=${limit}`,
        );
        if (mounted) setProducts(res.data.data || []);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchRelated();

    return () => {
      mounted = false;
    };
  }, [productId, limit]);

  return { products, isLoading, error };
};

export default useRelatedProducts;
