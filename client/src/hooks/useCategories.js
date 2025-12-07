import { useState, useEffect, useMemo } from "react";
import api from "../services/api";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/categories");
      setCategories(response.data || []);
    } catch (err) {
      setError(err.message || "Error fetching categories");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Transform categories thành structure phù hợp cho UI
  // Chỉ lấy parent categories (parent_id === null) và children của chúng
  const transformedCategories = useMemo(() => {
    return categories
      .filter((cat) => !cat.parent_id) // Chỉ lấy parent categories
      .map((parent) => ({
        id: parent.id,
        name: parent.name,
        description: parent.description,
        children: parent.children || [],
      }));
  }, [categories]);

  return {
    categories: transformedCategories,
    allCategories: categories, // Tất cả categories (bao gồm cả children)
    isLoading,
    error,
    refetch: fetchCategories,
  };
};
