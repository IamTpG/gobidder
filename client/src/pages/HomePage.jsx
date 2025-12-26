import React from "react";

import {
  useTopEndingSoon,
  useTopMostBids,
  useTopHighestPrice,
} from "../hooks/useTopProducts";
import HeroSection from "../components/home/HeroSection";
import ProductSection from "../components/home/ProductSection";
// import TestimonialSection from "../components/sections/TestimonialSection";
import Spinner from "../components/common/Spinner";

const HomePage = () => {
  // Fetch data từ các hooks
  const {
    products: endingSoonItems,
    isLoading: loadingEndingSoon,
    error: errorEndingSoon,
  } = useTopEndingSoon();
  const {
    products: mostBidsItems,
    isLoading: loadingMostBids,
    error: errorMostBids,
  } = useTopMostBids();
  const {
    products: highestPriceItems,
    isLoading: loadingHighestPrice,
    error: errorHighestPrice,
  } = useTopHighestPrice();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Top 5 sản phẩm gần kết thúc */}
      {loadingEndingSoon ? (
        <div className="py-12 flex justify-center items-center bg-slate-50">
          <Spinner size="lg" />
        </div>
      ) : errorEndingSoon ? (
        <div className="py-12 text-center bg-slate-50">
          <p className="text-red-600">
            Error loading products: {errorEndingSoon}
          </p>
        </div>
      ) : (
        <ProductSection
          subtitle="ENDING SOON"
          title="Last Chance to Bid"
          items={endingSoonItems}
          itemsPerView={5}
          className="bg-slate-50"
        />
      )}

      {/* Top 5 sản phẩm có nhiều lượt ra giá nhất */}
      {loadingMostBids ? (
        <div className="py-12 flex justify-center items-center bg-white">
          <Spinner size="lg" />
        </div>
      ) : errorMostBids ? (
        <div className="py-12 text-center bg-white">
          <p className="text-red-600">
            Error loading products: {errorMostBids}
          </p>
        </div>
      ) : (
        <ProductSection
          subtitle="TRENDING NOW"
          title="Most Popular Auctions"
          items={mostBidsItems}
          itemsPerView={5}
          className="bg-white"
        />
      )}

      {/* Top 5 sản phẩm có giá cao nhất */}
      {loadingHighestPrice ? (
        <div className="py-12 flex justify-center items-center bg-slate-50">
          <Spinner size="lg" />
        </div>
      ) : errorHighestPrice ? (
        <div className="py-12 text-center bg-slate-50">
          <p className="text-red-600">
            Error loading products: {errorHighestPrice}
          </p>
        </div>
      ) : (
        <ProductSection
          subtitle="PREMIUM COLLECTION"
          title="Highest Value Items"
          items={highestPriceItems}
          itemsPerView={5}
          className="bg-slate-50"
        />
      )}

      {/* Testimonial Section (Optional) */}
      {/* <TestimonialSection /> */}
    </div>
  );
};

export default HomePage;
