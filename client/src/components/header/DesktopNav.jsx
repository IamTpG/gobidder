import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import CategoryDropdown from "./CategoryDropdown";
import Button from "../common/Button";

/**
 * Component DesktopNav
 * Chứa toàn bộ các thành phần điều hướng chính trên màn hình lớn.
 */
const DesktopNav = ({
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
  setShowBidSettingModal,
}) => {
  const navigate = useNavigate();
  // Quản lý trạng thái dropdown (categories, blog, pages)
  const [hoveredDropdown, setHoveredDropdown] = useState(null);

  /**
   * Hàm xử lý chung cho sự kiện onMouseEnter/onMouseLeave của dropdown menu thông thường.
   * Categories dropdown có logic phức tạp hơn và được quản lý trong CategoryDropdown.
   * @param {string | null} menuKey
   */
  // const handleDropdownToggle = (menuKey) => {
  //   setHoveredDropdown(menuKey);
  // };

  return (
    <div className="hidden lg:flex flex-grow justify-between items-center">
      {/* Desktop Navigation Menu Links */}
      <nav className="flex items-center space-x-6 ml-8">
        <Link
          to="/"
          className={
            (!isProductsPage ? "text-primary" : "text-gray-900") +
            " font-medium hover:text-primary/70"
          }
        >
          Home
        </Link>

        <Link
          to="/products"
          className={
            (isProductsPage ? "text-primary" : "text-gray-900") +
            " font-medium hover:text-primary/70"
          }
        >
          Products
        </Link>

        {/* Category Dropdown (Component con) */}
        <CategoryDropdown
          categories={categories}
          categoriesLoading={categoriesLoading}
          hoveredDropdown={hoveredDropdown}
          setHoveredDropdown={setHoveredDropdown}
          navigate={navigate}
        />

        {/* Blog Dropdown */}
        {/* <div
          className="relative"
          onMouseEnter={() => handleDropdownToggle("blog")}
          onMouseLeave={() => handleDropdownToggle(null)}
        >
          <button className="text-gray-900 font-medium hover:text-primary flex items-center">
            Blog
            <svg
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                hoveredDropdown === "blog" ? "rotate-180" : ""
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
            className={`absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 transition-all duration-200 ease-in-out ${
              hoveredDropdown === "blog"
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible -translate-y-2 pointer-events-none"
            }`}
          >
            <a
              href="/blog-list"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
            >
              Blog List
            </a>
            <a
              href="/blog-detail"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Blog Detail
            </a>
          </div>
        </div> */}

        {/* Pages Dropdown */}
        {/* <div
          className="relative"
          onMouseEnter={() => handleDropdownToggle("pages")}
          onMouseLeave={() => handleDropdownToggle(null)}
        >
          <button className="text-gray-900 font-medium hover:text-primary flex items-center">
            Pages
            <svg
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                hoveredDropdown === "pages" ? "rotate-180" : ""
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
            className={`absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 transition-all duration-200 ease-in-out ${
              hoveredDropdown === "pages"
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible -translate-y-2 pointer-events-none"
            }`}
          >
            <a
              href="/about"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
            >
              About
            </a>
            <a
              href="/faq"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              FAQ
            </a>
          </div>
        </div> */}

        {/* <a
          href="/contact"
          className="text-gray-900 font-medium hover:text-primary"
        >
          Contact
        </a> */}

        {isAdmin && (
          <button
            onClick={() => setShowBidSettingModal(true)}
            className="text-red-600 font-bold hover:text-primary ml-4"
          >
            Bid Setting
          </button>
        )}
      </nav>

      {/* Desktop Search Bar & Account Button */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        {!isProductsPage && (
          <div className="hidden lg:flex items-center space-x-2 ml-8">
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
        <Button
          onClick={() => handleAccountNavigate("desktop")}
          disabled={authLoading}
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
  );
};

export default DesktopNav;
