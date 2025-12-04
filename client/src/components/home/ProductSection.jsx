import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../common/ProductCard";
// import { CategoryFilter } from "../common";

const ProductSection = ({
  title,
  subtitle,
  items = [],
  itemsPerView = 5,
  className = "",
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responsiveItemsPerView, setResponsiveItemsPerView] =
    useState(itemsPerView);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Responsive items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile: 1 item
        setResponsiveItemsPerView(1);
      } else if (width < 768) {
        // Small tablet: 2 items
        setResponsiveItemsPerView(2);
      } else if (width < 1024) {
        // Tablet: 3 items
        setResponsiveItemsPerView(3);
      } else if (width < 1280) {
        // Small desktop: 4 items
        setResponsiveItemsPerView(4);
      } else {
        // Large desktop: use original itemsPerView prop
        setResponsiveItemsPerView(itemsPerView);
      }
    };

    // Initial check
    updateItemsPerView();

    // Add event listener
    window.addEventListener("resize", updateItemsPerView);

    // Cleanup
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [itemsPerView]);

  // Tính số items có thể scroll
  const maxIndex = Math.max(0, items.length - responsiveItemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Handle scroll snap on mobile with debounce
  const handleScroll = () => {
    if (containerRef.current) {
      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout
      scrollTimeoutRef.current = setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;

        // Get all card elements
        const cards = container.querySelectorAll(".flex > div");
        if (cards.length === 0) return;

        const containerRect = container.getBoundingClientRect();
        let closestIndex = 0;
        let minDistance = Infinity;

        // Find which card is closest to the left edge of container
        cards.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const distance = Math.abs(cardRect.left - containerRect.left);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        if (closestIndex !== currentIndex) {
          setCurrentIndex(closestIndex);
        }
      }, 150); // 150ms debounce
    }
  };

  // Scroll khi currentIndex thay đổi
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cards = container.querySelectorAll(".flex > div");

      if (cards[currentIndex]) {
        const targetCard = cards[currentIndex];
        const containerRect = container.getBoundingClientRect();
        const cardRect = targetCard.getBoundingClientRect();

        // Calculate scroll position
        const scrollLeft =
          container.scrollLeft + (cardRect.left - containerRect.left);

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex]);

  return (
    <section className={`py-8 sm:py-12 md:py-16 ${className}`}>
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-8 gap-4">
          <div className="flex-1">
            {subtitle && (
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span className="text-slate-400">→</span>
                {subtitle}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              {title}
            </h2>
          </div>

          {/* Navigation Controls - Desktop Only */}
          {items.length > responsiveItemsPerView && (
            <div className="hidden lg:flex items-center gap-3 ml-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:bg-transparent"
                aria-label="Previous"
              >
                <svg
                  className="w-5 h-5 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex >= items.length - responsiveItemsPerView}
                className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:bg-transparent"
                aria-label="Next"
              >
                <svg
                  className="w-5 h-5 text-slate-700"
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
              </button>
            </div>
          )}
        </div>

        {/* Filter (Optional) */}
        {/* <div className="mb-8">
          <CategoryFilter />
        </div> */}

        {/* Auction Cards Carousel */}
        {items.length > 0 ? (
          <div className="relative">
            {/* Cards Container with Smooth Scroll */}
            <div
              ref={containerRef}
              onScroll={handleScroll}
              className="overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
                WebkitOverflowScrolling: "touch", // iOS momentum scrolling
              }}
            >
              <div className="flex gap-3 sm:gap-4 md:gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] xl:w-[calc(20%-1.2rem)] snap-start snap-always"
                  >
                    <ProductCard
                      {...item}
                      onClick={() => navigate(`/products/${item.id}`)}
                      onBid={() =>
                        console.log("Bid on:", item.name || item.title)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Indicators for Mobile/Tablet */}
            {items.length > responsiveItemsPerView && (
              <div className="flex lg:hidden justify-center gap-2 mt-6">
                {items
                  .slice(0, items.length - responsiveItemsPerView + 1)
                  .map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentIndex === idx
                          ? "w-8 bg-primary"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
              </div>
            )}

            {/* View All Button */}
            <div className="text-center mt-8 sm:mt-12">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-primary text-primary font-medium rounded-xl hover:bg-primary hover:text-white transition-all text-sm sm:text-base"
              >
                View All Auction
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No auctions found
            </h3>
            <p className="text-slate-600">
              Check back later for exciting new items!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
