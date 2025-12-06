import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useCategories } from "../../hooks/useCategories";
import { useAuth } from "../../contexts/AuthContext";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import Logo from "./Logo";

/**
 * @typedef {object} Category
 * @property {string} id
 * @property {string} name
 * @property {Category[]} children
 */

/**
 * Component Header chính của ứng dụng.
 * Quản lý trạng thái mobile menu, search, và điều hướng cơ bản.
 */
const Header = () => {
  // Trạng thái cho Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null); // Cho mobile submenu (Categories, Blog, Pages)

  // Trạng thái cho Search
  const [searchValue, setSearchValue] = useState("");
  const isProductsPage = useLocation().pathname.startsWith("/products");

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { user, loading: authLoading } = useAuth();

  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "Admin";
  const accountLabel = authLoading
    ? "..."
    : isLoggedIn
      ? "My Account"  
      : "Login";

  /**
   * Effect để đồng bộ trạng thái search input với query param 'q' khi ở trang /products
   */
  useEffect(() => {
    if (!isProductsPage) return;
    const params = new URLSearchParams(location.search);
    const qParam = params.get("q") || "";
    setSearchValue(qParam);
  }, [isProductsPage, location.search]);

  /**
   * Effect quản lý body overflow khi mobile menu mở/đóng
   */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /**
   * Đóng/Mở mobile menu
   * @param {Event} e
   */
  const toggleMobileMenu = (e) => {
    if (e) e.stopPropagation();
    setIsMobileMenuOpen((prev) => !prev);
    setExpandedMenu(null); // Đảm bảo đóng hết submenu khi mở/đóng menu chính
  };

  /**
   * Đóng/Mở submenu trong mobile menu
   * @param {string | null} menu - Tên của menu cần mở rộng
   */
  const toggleSubMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  /**
   * Xử lý điều hướng đến trang Account/Login
   * @param {'mobile' | 'desktop'} origin - Nguồn click (để đóng mobile menu nếu cần)
   */
  const handleAccountNavigate = (origin) => {
    const target = isLoggedIn ? "/profile" : "/auth";
    navigate(target);
    if (origin === "mobile") {
      setIsMobileMenuOpen(false);
    }
  };

  /**
   * Xử lý submit search form (desktop và mobile)
   * Điều hướng đến trang /products với query param 'q'
   * @param {Event} e
   */
  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    const queryString = params.toString();
    navigate(`/products${queryString ? `?${queryString}` : ""}`);
    setIsMobileMenuOpen(false); // Đóng mobile menu sau khi search
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto px-4">
          <div className="flex items-center w-full h-20">
            {/* Logo Section */}
            <Logo />

            {/* Hamburger Button (Mobile Only) */}
            <div className="flex flex-grow flex-row-reverse">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-900 hover:text-primary transition-colors z-50 relative"
                aria-label="Toggle menu"
              >
                {/* Animation cho Hamburger/Close icon */}
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
            </div>

            {/* Component Desktop Navigation */}
            <DesktopNav
              categories={categories}
              categoriesLoading={categoriesLoading}
              isAdmin={isAdmin}
              isProductsPage={isProductsPage}
              authLoading={authLoading}
              accountLabel={accountLabel}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              handleAccountNavigate={handleAccountNavigate}
              handleHeaderSearchSubmit={handleHeaderSearchSubmit}
            />
          </div>
        </div>

        {/* Component Mobile Menu Sidebar */}
        <MobileMenu
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          expandedMenu={expandedMenu}
          toggleSubMenu={toggleSubMenu}
          categories={categories}
          categoriesLoading={categoriesLoading}
          isAdmin={isAdmin}
          isProductsPage={isProductsPage}
          authLoading={authLoading}
          accountLabel={accountLabel}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          handleAccountNavigate={handleAccountNavigate}
          handleHeaderSearchSubmit={handleHeaderSearchSubmit}
        />
      </header>
    </>
  );
};

export default Header;
