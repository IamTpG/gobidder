import React from "react";
import HeroSection from "../components/sections/HeroSection";
import AuctionSection from "../components/sections/AuctionSection";
import TestimonialSection from "../components/sections/TestimonialSection";
import {
  useTopEndingSoon,
  useTopMostBids,
  useTopHighestPrice,
} from "../hooks/useTopProducts";
import Spinner from "../components/common/Spinner";

const Home = () => {
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

  // Transform data từ API format sang AuctionCard format
  const transformProducts = (products) => {
    return products.map((product) => {
      // Tính thời gian còn lại
      const calculateTimeLeft = (endDate) => {
        const difference = new Date(endDate) - new Date();

        if (difference > 0) {
          return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }

        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      };

      // Parse images JSON
      const images =
        typeof product.images === "string"
          ? JSON.parse(product.images)
          : product.images;

      return {
        id: product.id,
        image:
          images && images.length > 0
            ? images[0]
            : "https://via.placeholder.com/400x300?text=No+Image",
        title: product.name,
        currentBid: typeof product.current_price === 'number' 
          ? product.current_price 
          : parseFloat(product.current_price) || 0,
        buyNowPrice: product.buy_now_price
          ? (typeof product.buy_now_price === 'number' 
              ? product.buy_now_price 
              : parseFloat(product.buy_now_price))
          : undefined,
        startingBid: typeof product.start_price === 'number'
          ? product.start_price
          : parseFloat(product.start_price) || 0,
        highestBidder: product.current_bidder?.full_name || null,
        bidCount: product.bid_count || 0,
        createdAt: product.created_at,
        status: product.status.toLowerCase(),
        endDate: product.end_time,
        timeLeft: calculateTimeLeft(product.end_time),
        buttonVariant: product.bid_count > 0 ? "success" : "dark",
      };
    });
  };

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
        <AuctionSection
          subtitle="⏰ ENDING SOON"
          title="Last Chance to Bid"
          items={transformProducts(endingSoonItems)}
          showFilter={false}
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
        <AuctionSection
          subtitle="🔥 TRENDING NOW"
          title="Most Popular Auctions"
          items={transformProducts(mostBidsItems)}
          showFilter={false}
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
        <AuctionSection
          subtitle="💎 PREMIUM COLLECTION"
          title="Highest Value Items"
          items={transformProducts(highestPriceItems)}
          showFilter={false}
          itemsPerView={5}
          className="bg-slate-50"
        />
      )}

      {/* Testimonial Section */}
      <TestimonialSection />
    </div>
  );
};

export default Home;
