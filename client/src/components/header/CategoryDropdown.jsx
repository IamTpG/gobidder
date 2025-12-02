import React, { useState, useRef } from "react";

/**
 * Component CategoryDropdown
 * Quản lý dropdown menu 2 cấp độ cho Categories (hovering).
 */
const CategoryDropdown = ({
  categories,
  categoriesLoading,
  hoveredDropdown,
  setHoveredDropdown,
  navigate,
}) => {
  const [hoveredParentCategory, setHoveredParentCategory] = useState(null);
  const [childMenuTop, setChildMenuTop] = useState(0);
  const parentItemRefs = useRef({});
  const dropdownContainerRef = useRef(null);
  const hideDropdownTimeout = useRef(null);

  /**
   * Xóa timer đóng dropdown đang chờ (nếu có)
   */
  const clearDropdownCloseTimer = () => {
    if (hideDropdownTimeout.current) {
      clearTimeout(hideDropdownTimeout.current);
      hideDropdownTimeout.current = null;
    }
  };

  /**
   * Thiết lập timer để đóng dropdown sau 300ms
   */
  const closeCategoryDropdown = () => {
    hideDropdownTimeout.current = setTimeout(() => {
      setHoveredDropdown(null);
      setHoveredParentCategory(null);
      setChildMenuTop(0);
    }, 300);
  };

  /**
   * Xử lý khi click vào Parent Category
   * @param {string} categoryId
   */
  const handleParentCategoryClick = (categoryId) => {
    sessionStorage.setItem("products_fromNavigation", "true");
    navigate(`/products?categoryId=${categoryId}`);
    setHoveredDropdown(null);
  };

  /**
   * Xử lý khi click vào Child Category
   * @param {string} categoryId
   */
  const handleChildCategoryClick = (categoryId) => {
    sessionStorage.setItem("products_fromNavigation", "true");
    navigate(`/products?categoryId=${categoryId}`);
    setHoveredDropdown(null);
  };

  /**
   * Xử lý sự kiện hover vào Parent Category để tính toán vị trí menu con
   * @param {string} parentId
   */
  const handleParentMouseEnter = (parentId) => {
    clearDropdownCloseTimer();
    setHoveredParentCategory(parentId);

    // Tính toán vị trí top của child menu dựa trên vị trí của parent item
    const parentElement = parentItemRefs.current[parentId];
    const containerElement = dropdownContainerRef.current;
    if (parentElement && containerElement) {
      const parentRect = parentElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      const relativeTop = parentRect.top - containerRect.top;
      setChildMenuTop(relativeTop);
    }
  };

  // Lấy parent category đang hover để hiển thị menu con
  const hoveredParent = categories.find(
    (cat) => cat.id === hoveredParentCategory,
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearDropdownCloseTimer();
        setHoveredDropdown("categories");
      }}
      onMouseLeave={closeCategoryDropdown}
    >
      <button
        onClick={() => navigate("/products")}
        className="text-gray-900 font-medium hover:text-primary flex items-center"
      >
        Categories
        <svg
          className={`w-4 h-4 ml-1 transition-transform duration-200 ${
            hoveredDropdown === "categories" ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`absolute top-[16px] left-0 mt-3 min-w-28 bg-white border border-gray-200 rounded-md shadow-lg z-50 transition-all duration-200 ease-in-out ${
          hoveredDropdown === "categories"
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2 pointer-events-none"
        }`}
      >
        {categoriesLoading ? (
          <div className="px-6 py-4 text-sm text-gray-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-4 text-sm text-gray-500">
            No categories available
          </div>
        ) : (
          <div className="relative flex" ref={dropdownContainerRef}>
            {/* Cột 1: Parent categories */}
            <div className="w-48 bg-white">
              {categories.map((parent) => {
                const hasChildren =
                  parent.children && parent.children.length > 0;
                const isHovered = hoveredParentCategory === parent.id;
                return (
                  <div
                    key={parent.id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      isHovered
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    ref={(el) => {
                      if (el) {
                        parentItemRefs.current[parent.id] = el;
                      }
                    }}
                    onMouseEnter={() => handleParentMouseEnter(parent.id)}
                    onClick={() => handleParentCategoryClick(parent.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{parent.name}</span>
                      {hasChildren && (
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột 2: Children categories - Positioned absolutely */}
            {hoveredParent && hoveredParent.children.length > 0 && (
              <div
                className="absolute left-[190px] min-w-[200px] max-h-[400px] overflow-y-auto bg-white border-l border-gray-200 shadow-lg ml-1 rounded-r-md"
                style={{
                  top: `${childMenuTop}px`,
                }}
                onMouseEnter={clearDropdownCloseTimer}
                onMouseLeave={closeCategoryDropdown}
              >
                {hoveredParent.children.map((child) => (
                  <button
                    key={child.id}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => handleChildCategoryClick(child.id)}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}
            {hoveredParent && hoveredParent.children.length === 0 && (
              <div
                className="absolute left-[190px] min-w-[200px] max-h-[400px] overflow-y-auto bg-white border-l border-gray-200 shadow-lg ml-1 rounded-r-md"
                style={{ top: `${childMenuTop}px` }}
              >
                <div className="px-4 py-3 text-sm text-gray-500">
                  No subcategories
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDropdown;
