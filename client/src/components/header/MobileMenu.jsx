import React from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../common/Button";
import Logo from "./Logo";

/**
 * Component MobileMenu
 * Chứa toàn bộ giao diện và logic của Mobile Sidebar Menu.
 */
const MobileMenu = ({
  isMobileMenuOpen,
  toggleMobileMenu,
  expandedMenu,
  toggleSubMenu,
  categories,
  categoriesLoading,
  isAdmin,
  isProductsPage,
  authLoading,
  accountLabel,
  searchValue,
  setSearchValue,
  handleAccountNavigate,
  handleHeaderSearchSubmit,
}) => {
  const navigate = useNavigate();

  /**
   * Xử lý điều hướng category trong mobile menu
   * @param {string} categoryId
   */
  const handleCategoryNavigation = (categoryId) => {
    sessionStorage.setItem("products_fromNavigation", "true");
    navigate(`/products?categoryId=${categoryId}`);
    toggleMobileMenu();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={toggleMobileMenu}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0 pointer-events-auto"
              : "-translate-x-full pointer-events-none"
          }
        `}
        onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng menu khi click vào sidebar
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-900 hover:text-primary text-2xl font-bold"
            aria-label="Close menu"
          >
            x
          </button>
        </div>

        {/* Logo Section */}
        <div className="px-6 pb-6 border-b border-gray-200">
          <Logo />
        </div>

        {/* Navigation Links */}
        <nav className="px-6 py-6 space-y-2">
          <Link
            to="/"
            className={
              (!isProductsPage ? "text-primary" : "text -gray-900") +
              " block py-2 font-medium"
            }
            onClick={toggleMobileMenu}
          >
            Home
          </Link>

          <Link
            to="/products"
            className={
              (isProductsPage ? "text-primary" : "text -gray-900") +
              " block py-2 font-medium"
            }
            onClick={toggleMobileMenu}
          >
            Products
          </Link>

          {/* Categories Submenu (Accordion) */}
          <div>
            {/* Nút chính để mở/đóng menu Categories cấp 1 */}
            <button
              // Khi nhấn nút này, nó sẽ chuyển đổi giữa "categories" và null
              onClick={() => toggleSubMenu("categories")}
              className="w-full flex items-center justify-between py-2 text-gray-900 font-medium"
            >
              <span>Categories</span>
              <span className="text-gray-400">
                {/* Kiểm tra cả menu cấp 1 và menu con có mở hay không */}
                {expandedMenu === "categories" ||
                expandedMenu?.startsWith("category-")
                  ? "−"
                  : "+"}
              </span>
            </button>

            {/* Nội dung categories (cấp 2 và sâu hơn) */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "categories" ||
                expandedMenu?.startsWith("category-")
                  ? "max-h-96 opacity-100" // Đảm bảo luôn mở nếu có menu con đang mở
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-4 space-y-2 mt-2">
                {categoriesLoading ? (
                  <div className="py-2 text-gray-600 text-sm">
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="py-2 text-gray-600 text-sm">
                    No categories available
                  </div>
                ) : (
                  categories.map((parent) => {
                    const hasChildren =
                      parent.children && parent.children.length > 0;
                    const isParentExpanded =
                      expandedMenu === `category-${parent.id}`;
                    return (
                      <div key={parent.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          {/* Nút Tên Category (Electronic) */}
                          <button
                            onClick={() => handleCategoryNavigation(parent.id)}
                            className="py-2 text-gray-600 text-sm hover:text-primary flex-1 text-left"
                          >
                            {parent.name}
                          </button>

                          {/* Nút Dấu +/- để mở/đóng Menu con */}
                          {hasChildren && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Chỉ mở/đóng menu con: set về null (đóng) hoặc category-id (mở)
                                toggleSubMenu(
                                  isParentExpanded
                                    ? null
                                    : `category-${parent.id}`
                                );
                              }}
                              className="text-gray-400 px-2"
                            >
                              {isParentExpanded ? "−" : "+"}
                            </button>
                          )}
                        </div>

                        {/* Nested Children Categories (Laptops) */}
                        {hasChildren && isParentExpanded && (
                          <div className="pl-4 space-y-1 border-l-2 border-gray-200">
                            {parent.children.map((child) => (
                              <button
                                key={child.id}
                                // Ấn vào menu con luôn điều hướng và đóng menu
                                onClick={() =>
                                  handleCategoryNavigation(child.id)
                                }
                                className="block py-1.5 text-gray-500 text-xs hover:text-primary w-full text-left"
                              >
                                {child.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Blog Submenu */}
          {/* <div>
            <button
              onClick={() => toggleSubMenu("blog")}
              className="w-full flex items-center justify-between py-2 text-gray-900 font-medium"
            >
              <span>Blog</span>
              <span className="text-gray-400">
                {expandedMenu === "blog" ? "−" : "+"}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "blog"
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-4 space-y-2 mt-2">
                <a
                  href="/blog-list"
                  className="block py-2 text-gray-600 text-sm"
                  onClick={toggleMobileMenu}
                >
                  Blog List
                </a>
                <a
                  href="/blog-detail"
                  className="block py-2 text-gray-600 text-sm"
                  onClick={toggleMobileMenu}
                >
                  Blog Detail
                </a>
              </div>
            </div>
          </div> */}

          {/* Pages Submenu */}
          {/* <div>
            <button
              onClick={() => toggleSubMenu("pages")}
              className="w-full flex items-center justify-between py-2 text-gray-900 font-medium"
            >
              <span>Pages</span>
              <span className="text-gray-400">
                {expandedMenu === "pages" ? "−" : "+"}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "pages"
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-4 space-y-2 mt-2">
                <a
                  href="/about"
                  className="block py-2 text-gray-600 text-sm"
                  onClick={toggleMobileMenu}
                >
                  About
                </a>
                <a
                  href="/faq"
                  className="block py-2 text-gray-600 text-sm"
                  onClick={toggleMobileMenu}
                >
                  FAQ
                </a>
              </div>
            </div>
          </div> */}

          {/* <a
            href="/contact"
            className="block py-2 text-gray-900 font-medium"
            onClick={toggleMobileMenu}
          >
            Contact
          </a> */}

          {isAdmin && (
            <Link
              to="/admin/bid-settings"
              onClick={toggleMobileMenu}
              className="block py-2 text-red-600 font-bold w-full text-left"
            >
              Bid Setting
            </Link>
          )}
        </nav>

        {/* Contact Information */}
        {/* <div className="px-6 py-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <i className="fas fa-envelope"></i>
            <span className="text-sm">info@example.com</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <i className="fas fa-headset"></i>
            <span className="text-sm">Customer support</span>
          </div>
        </div> */}

        {/* Search Bar */}
        {!isProductsPage && (
          <div className="px-6 py-4 border-t border-gray-200">
            <form
              onSubmit={handleHeaderSearchSubmit}
              className="flex items-center rounded-lg border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all"
            >
              <input
                type="text"
                placeholder="Search your product..."
                className="px-4 py-2 rounded-l-lg outline-none border-none w-64 text-sm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/70 text-white px-4 py-2 rounded-r-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Account/Login Button */}
        <div className="flex px-6 py-4 border-t border-gray-200">
          <Button
            onClick={() => handleAccountNavigate("mobile")}
            disabled={authLoading}
            className="flex-grow"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{accountLabel}</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
