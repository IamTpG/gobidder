import React, { useState, useEffect } from "react";

const Header = () => {
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

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
              onMouseEnter={() => setHoveredDropdown("auctions")}
              onMouseLeave={() => setHoveredDropdown(null)}
            >
              <button className="text-gray-900 font-medium hover:text-primary flex items-center">
                Auctions
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                    hoveredDropdown === "auctions" ? "rotate-180" : ""
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
                  hoveredDropdown === "auctions"
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none"
                }`}
              >
                <a
                  href="/auctions-grid"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  Auctions Grid
                </a>
                <a
                  href="/auctions-sidebar"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  Auctions Sidebar
                </a>
                <a
                  href="/auctions-details"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Auctions Details
                </a>
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
            <div className="hidden lg:flex items-center space-x-2 ml-8">
              <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <input
                  type="text"
                  placeholder="Search your product..."
                  className="px-4 py-2 rounded-l-lg outline-none border-none w-64 text-sm"
                />
                <button className="bg-primary hover:bg-primary/70 text-white px-4 py-2 rounded-r-lg transition-colors">
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
              </div>
            </div>

            {/* Desktop My Account Button - Hidden on mobile */}
            <button className="hidden lg:flex bg-gray-900 hover:bg-primary text-white px-4 py-2 rounded-lg items-center space-x-2 ml-4 transition-colors">
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
              <span>My Account</span>
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
                onClick={() => toggleSubMenu("auctions")}
                className="w-full flex items-center justify-between py-2 text-gray-900 font-medium"
              >
                <span>Auctions</span>
                <span className="text-gray-400">
                  {expandedMenu === "auctions" ? "−" : "+"}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedMenu === "auctions"
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-4 space-y-2 mt-2">
                  <a
                    href="/auctions-grid"
                    className="block py-2 text-gray-600 text-sm"
                    onClick={toggleMobileMenu}
                  >
                    Auctions Grid
                  </a>
                  <a
                    href="/auctions-sidebar"
                    className="block py-2 text-gray-600 text-sm"
                    onClick={toggleMobileMenu}
                  >
                    Auctions Sidebar
                  </a>
                  <a
                    href="/auctions-details"
                    className="block py-2 text-gray-600 text-sm"
                    onClick={toggleMobileMenu}
                  >
                    Auctions Details
                  </a>
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
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <input
                type="text"
                placeholder="Search your product..."
                className="px-4 py-2 rounded-l-lg outline-none border-none w-64 text-sm"
              />
              <button className="bg-primary hover:bg-primary/70 text-white px-4 py-2 rounded-r-lg transition-colors">
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
            </div>
          </div>

          {/* My Account Button */}
          <div className="px-6 py-4 border-t border-gray-200">
            <button className="w-full bg-gray-900 hover:bg-primary text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
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
              <span>My Account</span>
            </button>
          </div>
        </div>
      </>
    </header>
  );
};

export default Header;
