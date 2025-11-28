import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const ITEMS_PER_PAGE = 9;

/**
 * Hook chung để quản lý danh sách sản phẩm với pagination, filters, và search
 * @param {Object} options - Cấu hình hook
 * @param {string} options.endpoint - API endpoint (default: '/products')
 * @param {boolean} options.enableStatusFilter - Bật filter theo status (default: false)
 * @param {boolean} options.preserveOtherParams - Giữ lại các params khác khi sync URL (default: false)
 */
export const useProductList = ({
  endpoint = "/products",
  enableStatusFilter = false,
  preserveOtherParams = false,
} = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsString = searchParams.toString();

  // Parse filters từ URL
  const parseFiltersFromSearchParams = useCallback(
    (params) => {
      const pageParam = parseInt(params.get("page"), 10);
      const sortParam = params.get("sort") || "created_at";
      const categoryParam = params.get("categoryId") || undefined;
      const qParam = params.get("q") || "";
      const statusParam = enableStatusFilter
        ? params.get("status") || undefined
        : undefined;

      return {
        page: Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1,
        sort: sortParam,
        categoryId: categoryParam,
        q: qParam,
        status: statusParam,
      };
    },
    [enableStatusFilter],
  );

  const initialFiltersRef = useRef(parseFiltersFromSearchParams(searchParams));
  const initialFilters = initialFiltersRef.current;

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialFilters.page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId);
  const [sort, setSort] = useState(initialFilters.sort);
  const [q, setQ] = useState(initialFilters.q);
  const [status, setStatus] = useState(initialFilters.status);

  const prevQRef = useRef(initialFilters.q?.trim() || "");
  const searchTimeoutRef = useRef(null);
  const isApplyingSearchParams = useRef(false);

  // Hàm fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProducts([]);

    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort,
      };

      if (categoryId) params.categoryId = categoryId;
      const searchQuery = q?.trim();
      if (searchQuery) params.q = searchQuery;
      if (enableStatusFilter && status) params.status = status;

      const response = await api.get(endpoint, { params });

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
  }, [categoryId, currentPage, q, sort, status, endpoint, enableStatusFilter]);

  // Đồng bộ state khi search params thay đổi
  useEffect(() => {
    const parsed = parseFiltersFromSearchParams(searchParams);
    let didUpdate = false;

    setCurrentPage((prev) => {
      if (prev === parsed.page) return prev;
      didUpdate = true;
      return parsed.page;
    });

    setSort((prev) => {
      if (prev === parsed.sort) return prev;
      didUpdate = true;
      return parsed.sort;
    });

    setCategoryId((prev) => {
      if ((prev ?? undefined) === parsed.categoryId) return prev;
      didUpdate = true;
      return parsed.categoryId;
    });

    setQ((prev) => {
      if (prev === parsed.q) return prev;
      didUpdate = true;
      const trimmed = parsed.q?.trim() || "";
      prevQRef.current = trimmed;
      return parsed.q;
    });

    if (enableStatusFilter) {
      setStatus((prev) => {
        if ((prev ?? undefined) === parsed.status) return prev;
        didUpdate = true;
        return parsed.status;
      });
    }

    if (didUpdate) {
      isApplyingSearchParams.current = true;
    }
  }, [
    searchParamsString,
    searchParams,
    parseFiltersFromSearchParams,
    enableStatusFilter,
  ]);

  // Fetch products khi state thay đổi
  useEffect(() => {
    // Debounce cho search query
    const searchQuery = q?.trim() || "";
    const isSearchChange = searchQuery !== prevQRef.current;

    if (isSearchChange && searchQuery) {
      // Debounce 500ms cho search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        prevQRef.current = searchQuery;
        fetchProducts();
      }, 500);
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    } else if (isSearchChange && !searchQuery) {
      // Search bị xóa: fetch ngay
      prevQRef.current = "";
      fetchProducts();
    } else {
      // Các thay đổi khác (sort, category, page, status): fetch ngay
      fetchProducts();
    }
  }, [currentPage, categoryId, sort, q, status, fetchProducts]);

  // Sync state với URL khi người dùng thay đổi filter tại UI
  useEffect(() => {
    if (isApplyingSearchParams.current) {
      isApplyingSearchParams.current = false;
      return;
    }

    const trimmedQ = q?.trim() || "";
    // Tạo params từ searchParams hiện tại nếu cần giữ lại params khác
    const params = preserveOtherParams
      ? new URLSearchParams(searchParams)
      : new URLSearchParams();

    // Chỉ cập nhật các params liên quan đến products
    if (currentPage > 1) {
      params.set("page", String(currentPage));
    } else {
      params.delete("page");
    }
    if (sort && sort !== "created_at") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }
    if (trimmedQ) {
      params.set("q", trimmedQ);
    } else {
      params.delete("q");
    }
    if (enableStatusFilter) {
      if (status) {
        params.set("status", status);
      } else {
        params.delete("status");
      }
    }

    const nextParamsString = params.toString();
    if (nextParamsString !== searchParamsString) {
      const paramsObj = Object.fromEntries(params.entries());
      setSearchParams(paramsObj, { replace: true });
    }
  }, [
    currentPage,
    categoryId,
    sort,
    q,
    status,
    searchParamsString,
    searchParams,
    setSearchParams,
    preserveOtherParams,
    enableStatusFilter,
  ]);

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

  const handleStatusChange = useCallback(
    (value) => {
      if (!enableStatusFilter) return;
      setCurrentPage(1);
      setStatus((prev) => (prev === value ? undefined : value || undefined));
    },
    [enableStatusFilter],
  );

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

  const returnValue = {
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

  // Chỉ thêm status và handleStatusChange nếu enableStatusFilter = true
  if (enableStatusFilter) {
    returnValue.status = status;
    returnValue.handleStatusChange = handleStatusChange;
  }

  return returnValue;
};
