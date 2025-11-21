import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [hoveredParentCategory, setHoveredParentCategory] = useState(null);
  const [childMenuTop, setChildMenuTop] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isProductsPage = location.pathname.startsWith("/products");
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = Boolean(user);
  const parentItemRefs = useRef({});
  const dropdownContainerRef = useRef(null);
  const hideDropdownTimeout = useRef(null);
  const [searchValue, setSearchValue] = useState("");

  const clearDropdownCloseTimer = () => {
    if (hideDropdownTimeout.current) {
      clearTimeout(hideDropdownTimeout.current);
      hideDropdownTimeout.current = null;
    }
  };

  const closeCategoryDropdown = () => {
    hideDropdownTimeout.current = setTimeout(() => {
      setHoveredDropdown(null);
      setHoveredParentCategory(null);
      setChildMenuTop(0);
    }, 300);
  };

  useEffect(() => {
    return () => {
      clearDropdownCloseTimer();
    };
  }, []);

  useEffect(() => {
    if (!isProductsPage) return;
    const params = new URLSearchParams(location.search);
    const qParam = params.get("q") || "";
    setSearchValue(qParam);
  }, [isProductsPage, location.search]);
  // Close mobile menu when clicking outside or on backdrop
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsMobileMenuOpen((prev) => !prev);
    setExpandedMenu(null);
  };

  const toggleSubMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const handleAccountNavigate = (origin) => {
    const target = isLoggedIn ? "/profile" : "/auth";
    navigate(target);
    if (origin === "mobile") {
      setIsMobileMenuOpen(false);
    }
  };

  const accountLabel = authLoading
    ? "..."
    : isLoggedIn
      ? "My Account"
      : "Login";

  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    const queryString = params.toString();
    navigate(`/products${queryString ? `?${queryString}` : ""}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between w-full h-20">
          {/* Logo */}
          <a href="/" className="shrink-0">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-gray-900">PRO</span>
                <span className="relative ml-1">
                  <span className="bg-primary text-white px-2 py-1 rounded-md inline-block font-bold">
                    BID
                  </span>
                </span>
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 hidden md:block">
              Bid High, Win Big, Smile Bigger
            </p>
          </a>

          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMobileMenu(e);
            }}
            className="lg:hidden p-2 text-gray-900 hover:text-primary transition-colors z-50 relative"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-end items-end space-y-1.5">
              <span
                className={`block h-0.5 bg-gray-900 transition-all duration-300 w-full ${isMobileMenuOpen ? "rotate-45 translate-y-2 w-full" : ""}`}
              ></span>
              <span
                className={`block h-0.5 bg-gray-900 transition-all duration-300 w-4/5 ${isMobileMenuOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                className={`block h-0.5 bg-gray-900 transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2 w-full" : "w-3/5"}`}
              ></span>
            </div>
          </button>

          {/* Desktop Navigation Menu - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-6 ml-8">
            <a
              href="/"
              className="text-primary font-medium hover:text-primary/70"
            >
              Home
            </a>

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
                  <div className="relative" ref={dropdownContainerRef}>
                    {/* Parent categories */}
                    <div className="w-48 bg-white">
                      {categories.map((parent, index) => {
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
                            onMouseEnter={() => {
                              clearDropdownCloseTimer();
                              setHoveredParentCategory(parent.id);
                              // Tính toán vị trí top của child menu dựa trên vị trí của parent item
                              const parentElement =
                                parentItemRefs.current[parent.id];
                              const containerElement =
                                dropdownContainerRef.current;
                              if (parentElement && containerElement) {
                                const parentRect =
                                  parentElement.getBoundingClientRect();
                                const containerRect =
                                  containerElement.getBoundingClientRect();
                                const relativeTop =
                                  parentRect.top - containerRect.top;
                                setChildMenuTop(relativeTop);
                              }
                            }}
                            onClick={() => {
                              sessionStorage.setItem(
                                "products_fromNavigation",
                                "true",
                              );
                              navigate(`/products?categoryId=${parent.id}`);
                              setHoveredDropdown(null);
                            }}
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

                    {/* Children categories - Positioned absolutely */}
                    {hoveredParentCategory && (
                      <div
                        className="absolute left-[190px] min-w-[200px] max-h-[400px] overflow-y-auto bg-white border-l border-gray-200 shadow-lg ml-1 rounded-r-md"
                        style={{
                          top: `${childMenuTop}px`,
                        }}
                        onMouseEnter={clearDropdownCloseTimer}
                        onMouseLeave={closeCategoryDropdown}
                      >
                        {(() => {
                          const parent = categories.find(
                            (cat) => cat.id === hoveredParentCategory,
                          );
                          if (!parent) {
                            return (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                Category not found
                              </div>
                            );
                          }
                          const hasChildren =
                            parent.children && parent.children.length > 0;
                          if (!hasChildren) {
                            return (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No subcategories
                              </div>
                            );
                          }
                          return (
                            <div>
                              {parent.children.map((child) => (
                                <button
                                  key={child.id}
                                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "products_fromNavigation",
                                      "true",
                                    );
                                    navigate(
                                      `/products?categoryId=${child.id}`,
                                    );
                                    setHoveredDropdown(null);
                                  }}
                                >
                                  {child.name}
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setHoveredDropdown("blog")}
              onMouseLeave={() => setHoveredDropdown(null)}
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
            </div>

            <div
              className="relative"
              onMouseEnter={() => setHoveredDropdown("pages")}
              onMouseLeave={() => setHoveredDropdown(null)}
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
            </div>

            <a
              href="/contact"
              className="text-gray-900 font-medium hover:text-primary"
            >
              Contact
            </a>
          </nav>

          {/* Desktop Search Bar - Hidden on mobile */}

          <div className="hidden lg:flex items-center space-x-4">
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
            {/* Desktop Account/Login Button */}
            <button
              type="button"
              onClick={() => handleAccountNavigate("desktop")}
              className="hidden lg:flex bg-gray-900 hover:bg-primary text-white px-4 py-2 rounded-lg items-center space-x-2 ml-4 transition-colors disabled:opacity-60"
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
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
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
            ${isMobileMenuOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-900 hover:text-green-600 text-2xl font-bold"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          {/* Logo Section */}
          <div className="px-6 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-gray-900">PRO</span>
                <span className="relative ml-1">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-md inline-block font-bold">
                    BID
                  </span>
                </span>
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bid High, Win Big, Smile Bigger
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-6 py-6 space-y-2">
            <a
              href="/"
              className="block py-2 text-green-600 font-medium"
              onClick={toggleMobileMenu}
            >
              Home
            </a>

            <div>
              <button
                onClick={() => toggleSubMenu("categories")}
                className="w-full flex items-center justify-between py-2 text-gray-900 font-medium"
              >
                <span>Categories</span>
                <span className="text-gray-400">
                  {expandedMenu ? "−" : "+"}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedMenu ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                            <button
                              onClick={() => {
                                sessionStorage.setItem(
                                  "products_fromNavigation",
                                  "true",
                                );
                                navigate(`/products?categoryId=${parent.id}`);
                                toggleMobileMenu();
                              }}
                              className="py-2 text-gray-600 text-sm hover:text-primary flex-1 text-left"
                            >
                              {parent.name}
                            </button>
                            {hasChildren && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubMenu(
                                    isParentExpanded
                                      ? "categories"
                                      : `category-${parent.id}`,
                                  );
                                }}
                                className="text-gray-400 px-2"
                              >
                                {isParentExpanded ? "−" : "+"}
                              </button>
                            )}
                          </div>
                          {hasChildren && isParentExpanded && (
                            <div className="pl-4 space-y-1 border-l-2 border-gray-200">
                              {parent.children.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "products_fromNavigation",
                                      "true",
                                    );
                                    navigate(
                                      `/products?categoryId=${child.id}`,
                                    );
                                    toggleMobileMenu();
                                  }}
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

            <div>
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
            </div>

            <div>
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
            </div>

            <a
              href="/contact"
              className="block py-2 text-gray-900 font-medium"
              onClick={toggleMobileMenu}
            >
              Contact
            </a>
          </nav>

          {/* Contact Information */}
          <div className="px-6 py-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fas fa-envelope"></i>
              <span className="text-sm">info@example.com</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <i className="fas fa-headset"></i>
              <span className="text-sm">Customer support</span>
            </div>
          </div>

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
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleAccountNavigate("mobile")}
              disabled={authLoading}
              className="w-full bg-gray-900 hover:bg-primary text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-60"
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
            </button>
          </div>
        </div>
      </>
    </header>
  );
};

export default Header;
