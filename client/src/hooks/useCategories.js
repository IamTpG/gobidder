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
    const parentCategories = categories
      .filter((cat) => !cat.parent_id) // Chỉ lấy parent categories
      .map((parent) => ({
        id: parent.id,
        name: parent.name,
        description: parent.description,
        // Others không hiển thị sub-category
        children:
          parent.name.toLowerCase() === "others" ? [] : parent.children || [],
      }));

    // Sắp xếp: Others luôn ở cuối, các category khác sắp xếp theo thứ tự từ điển
    const sortedCategories = parentCategories.sort((a, b) => {
      const aIsOthers = a.name.toLowerCase() === "others";
      const bIsOthers = b.name.toLowerCase() === "others";

      if (aIsOthers && !bIsOthers) return 1; // Others xuống cuối
      if (!aIsOthers && bIsOthers) return -1; // Others xuống cuối
      if (aIsOthers && bIsOthers) return 0; // Cả hai đều là Others

      // Các category khác sắp xếp theo thứ tự từ điển
      return a.name.localeCompare(b.name);
    });

    return sortedCategories;
  }, [categories]);

  return {
    categories: transformedCategories,
    allCategories: categories, // Tất cả categories (bao gồm cả children)
    isLoading,
    error,
    refetch: fetchCategories,
  };
};
