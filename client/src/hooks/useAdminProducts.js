import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const ITEMS_PER_PAGE = 10;

export const useAdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1,
  );
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "created_at");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") || undefined,
  );

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort,
      };

      if (status && status !== "All") {
        params.status = status;
      }

      if (q.trim()) {
        params.q = q.trim();
      }

      if (categoryId) {
        params.categoryId = categoryId;
      }

      const response = await api.get("/products/admin/all", { params });

      const {
        data: apiProducts = [],
        pagination: {
          totalPages: apiTotalPages = 0,
          totalItems: apiTotalItems = 0,
        } = {},
      } = response.data || {};

      setProducts(apiProducts);
      setTotalPages(apiTotalPages);
      setTotalItems(apiTotalItems);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Error fetching products",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, status, sort, q, categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage);
    if (status && status !== "All") params.set("status", status);
    if (sort && sort !== "created_at") params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    if (categoryId) params.set("categoryId", categoryId);

    setSearchParams(params, { replace: true });
  }, [currentPage, status, sort, q, categoryId, setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleStatusChange = useCallback((newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSort(newSort);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((newQ) => {
    setQ(newQ);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setCurrentPage(1);
    setCategoryId((prev) => (prev === value ? undefined : value || undefined));
  }, []);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  const startResult =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endResult =
    totalItems === 0 ? 0 : Math.min(totalItems, currentPage * ITEMS_PER_PAGE);

  return {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    startResult,
    endResult,
    status,
    sort,
    q,
    categoryId,
    handlePageChange,
    handleStatusChange,
    handleSortChange,
    handleSearchChange,
    handleCategoryChange,
    refetch,
  };
};
