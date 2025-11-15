import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const ITEMS_PER_PAGE = 9;

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryId, setCategoryId] = useState(undefined);
  const [sort, setSort] = useState("created_at");
  const [q, setQ] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Ref để track xem có đang sync từ URL không (tránh circular update)
  const isSyncingFromURL = useRef(false);
  const isInitialMount = useRef(true);
  const prevQRef = useRef("");

  // Reset về trạng thái ban đầu khi reload trang (xóa URL params)
  useEffect(() => {
    // Chỉ chạy lần đầu mount
    if (isInitialMount.current) {
      // Xóa tất cả URL params để reset về trạng thái ban đầu
      const hasParams = searchParams.toString().length > 0;
      if (hasParams) {
        setSearchParams({}, { replace: true });
      }
      // Reset state về giá trị mặc định
      setCurrentPage(1);
      setCategoryId(undefined);
      setSort("created_at");
      setQ("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // Fetch products từ API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort,
      };

      if (categoryId) params.categoryId = categoryId;

      const searchQuery = q?.trim();
      if (searchQuery) params.q = searchQuery;

      const response = await api.get("/products", { params });

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
      setError(err.message || "Error fetching products");
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, currentPage, q, sort]);

  // Sync state với URL (chỉ khi state thay đổi từ user action, không sync khi reload)
  useEffect(() => {
    // Skip lần đầu mount (đã reset ở useEffect trên)
    if (isInitialMount.current) {
      return;
    }

    // Chỉ sync URL khi có filter/search/sort khác mặc định
    const hasFilters =
      categoryId || q?.trim() || sort !== "created_at" || currentPage !== 1;

    if (hasFilters) {
      const params = {
        page: String(currentPage),
        sort,
      };

      if (categoryId) params.categoryId = categoryId;
      // Chỉ thêm q vào URL nếu có giá trị (trim để tránh space)
      const searchQuery = q?.trim();
      if (searchQuery) params.q = searchQuery;

      setSearchParams(params, { replace: true });
    } else {
      // Nếu không có filter, xóa URL params
      setSearchParams({}, { replace: true });
    }
  }, [currentPage, categoryId, sort, q, setSearchParams]);

  // Fetch products khi state thay đổi (từ URL hoặc từ user action)
  useEffect(() => {
    // Lần đầu mount: fetch ngay
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevQRef.current = q || "";
      fetchProducts();
      return;
    }

    // Debounce chỉ cho search query (q), các thay đổi khác (sort, category, page) fetch ngay
    const searchQuery = q?.trim() || "";
    const isSearchChange = searchQuery !== prevQRef.current;

    if (isSearchChange && searchQuery) {
      // Debounce 500ms cho search khi có text
      const timer = setTimeout(() => {
        prevQRef.current = searchQuery;
        isSyncingFromURL.current = false; // Reset flag khi search debounce complete
        fetchProducts();
      }, 500);
      return () => {
        clearTimeout(timer);
      };
    } else if (isSearchChange && !searchQuery) {
      // Khi search bị xóa, fetch ngay
      prevQRef.current = "";
      isSyncingFromURL.current = false; // Reset flag
      fetchProducts();
    } else {
      // Fetch ngay cho sort, category, page (không phải search change)
      // Reset flag và fetch ngay, không cần delay
      isSyncingFromURL.current = false;
      fetchProducts();
    }
  }, [currentPage, categoryId, sort, q, fetchProducts]);

  // Handlers
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setCurrentPage(1);
    setCategoryId((prev) => (prev === value ? undefined : value || undefined));
  }, []);

  const handleSortChange = useCallback((value) => {
    setCurrentPage(1);
    setSort(value);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setCurrentPage(1);
    setQ(value);
  }, []);

  // Tính toán pagination info
  const startResult = useMemo(
    () => (totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1),
    [totalItems, currentPage],
  );
  const endResult = useMemo(
    () =>
      totalItems === 0 ? 0 : Math.min(totalItems, currentPage * ITEMS_PER_PAGE),
    [totalItems, currentPage],
  );

  return {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    startResult,
    endResult,
    categoryId,
    sort,
    q,
    handlePageChange,
    handleCategoryChange,
    handleSortChange,
    handleSearchChange,
  };
};
