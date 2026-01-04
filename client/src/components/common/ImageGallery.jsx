import React, { useState, useEffect } from "react";

const ImageGallery = ({
  images = [],
  alt = "Product image",
  className = "",
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const THUMBNAILS_PER_VIEW = 5;
  const AUTO_SLIDE_INTERVAL = 2500; // 2.5 giây

  // Auto slide - tự động chuyển ảnh sau 2.5 giây
  useEffect(() => {
    if (images.length <= 1 || isZoomed) return; // Không auto slide nếu chỉ có 1 ảnh hoặc đang zoom

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedImage((prev) => (prev + 1) % images.length); // Quay vòng về ảnh đầu
        setIsTransitioning(false);
      }, 300); // Thời gian hiệu ứng fade
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval); // Cleanup khi unmount
  }, [images.length, isZoomed]);

  // Auto scroll khi chọn hình nằm ngoài vùng hiển thị
  useEffect(() => {
    if (images.length <= THUMBNAILS_PER_VIEW) return;

    if (selectedImage < thumbnailStartIndex) {
      setThumbnailStartIndex(selectedImage);
    } else if (selectedImage >= thumbnailStartIndex + THUMBNAILS_PER_VIEW) {
      setThumbnailStartIndex(selectedImage - THUMBNAILS_PER_VIEW + 1);
    }
  }, [selectedImage, thumbnailStartIndex, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-xs">No image available</p>
      </div>
    );
  }

  const handlePrevThumbnails = () => {
    setThumbnailStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextThumbnails = () => {
    setThumbnailStartIndex((prev) =>
      Math.min(images.length - THUMBNAILS_PER_VIEW, prev + 1),
    );
  };

  const maxVisibleThumbnails = Math.min(images.length, THUMBNAILS_PER_VIEW);
  const visibleThumbnails = images.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + maxVisibleThumbnails,
  );

  const canScrollLeft = thumbnailStartIndex > 0;
  const canScrollRight =
    thumbnailStartIndex + THUMBNAILS_PER_VIEW < images.length;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden shadow-product group">
        <img
          src={images[selectedImage]}
          alt={`${alt} - ${selectedImage + 1}`}
          className={`
            w-full h-full object-cover transition-all duration-500
            ${isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in group-hover:scale-105"}
            ${isTransitioning ? "opacity-0" : "opacity-100"}
          `}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom Icon */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 z-10"
        >
          {isZoomed ? (
            <svg
              className="w-3.5 h-3.5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          )}
        </button>

        {/* Navigation Arrows (nếu có nhiều hơn 1 ảnh) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setSelectedImage((prev) =>
                    prev > 0 ? prev - 1 : images.length - 1,
                  );
                  setIsTransitioning(false);
                }, 300);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-700"
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
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setSelectedImage((prev) =>
                    prev < images.length - 1 ? prev + 1 : 0,
                  );
                  setIsTransitioning(false);
                }, 300);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-700"
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
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-full backdrop-blur-sm">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="relative">
          {/* Left Arrow - chỉ hiển thị khi có nhiều hơn 5 hình và có thể scroll */}
          {canScrollLeft && (
            <button
              onClick={handlePrevThumbnails}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
              aria-label="Previous thumbnails"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Thumbnail Container */}
          <div
            className={`flex gap-1.5 ${images.length > THUMBNAILS_PER_VIEW ? "px-8" : ""}`}
          >
            {visibleThumbnails.map((image, index) => {
              const actualIndex = thumbnailStartIndex + index;
              return (
                <button
                  key={actualIndex}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setSelectedImage(actualIndex);
                      setIsZoomed(false);
                      setIsTransitioning(false);
                    }, 300);
                  }}
                  className={`
                    flex-1 aspect-square rounded-md overflow-hidden border-2 transition-all duration-200
                    ${
                      selectedImage === actualIndex
                        ? "border-primary shadow-md scale-105 ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-105"
                    }
                  `}
                >
                  <img
                    src={image}
                    alt={`${alt} thumbnail ${actualIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          {/* Right Arrow - chỉ hiển thị khi có nhiều hơn 5 hình và có thể scroll */}
          {canScrollRight && (
            <button
              onClick={handleNextThumbnails}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
              aria-label="Next thumbnails"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
