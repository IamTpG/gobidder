import React, { useState, useRef, useEffect } from 'react';
import { AuctionCard } from '../common';
import { CategoryFilter } from '../common';

const AuctionSection = ({ 
  title, 
  subtitle,
  items = [], 
  showFilter = false,
  itemsPerView = 5,
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  // Tính số items có thể scroll
  const maxIndex = Math.max(0, items.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Scroll khi currentIndex thay đổi
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const itemWidth = container.scrollWidth / items.length;
      const scrollLeft = itemWidth * currentIndex;
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, items.length]);

  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header with Navigation Controls */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            {subtitle && (
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span className="text-slate-400">→</span>
                {subtitle}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {title}
            </h2>
          </div>

          {/* Navigation Controls - Top Right */}
          {items.length > itemsPerView && (
            <div className="flex items-center gap-3 ml-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:bg-transparent"
                aria-label="Previous"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentIndex >= items.length - itemsPerView}
                className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-300 disabled:hover:bg-transparent"
                aria-label="Next"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Optional Filter */}
        {showFilter && (
          <div className="mb-8">
            <CategoryFilter />
          </div>
        )}

        {/* Auction Cards Carousel */}
        {items.length > 0 ? (
          <div className="relative">
            {/* Cards Container */}
            <div 
              ref={containerRef}
              className="overflow-hidden"
            >
              <div 
                className="flex gap-6 transition-transform duration-300"
              >
                {items.map((item, index) => (
                  <div 
                    key={item.id || index}
                    className="flex-shrink-0"
                    style={{ 
                      width: `calc((100% - ${(itemsPerView - 1) * 24}px) / ${itemsPerView})`,
                      minWidth: '200px' // Minimum width
                    }}
                  >
                    <AuctionCard
                      lotNumber={item.lotNumber}
                      image={item.image}
                      title={item.title}
                      currentBid={item.currentBid}
                      startingBid={item.startingBid}
                      status={item.status}
                      endDate={item.endDate}
                      onBid={() => console.log('Bid on:', item.title)}
                      buttonVariant={item.buttonVariant || 'primary'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <button className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary text-primary font-medium rounded-xl hover:bg-primary hover:text-white transition-all">
                View All Auction
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

export default AuctionSection;
