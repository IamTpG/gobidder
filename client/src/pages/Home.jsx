import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import AuctionSection from '../components/sections/AuctionSection';
import TestimonialSection from '../components/sections/TestimonialSection';

const Home = () => {
  // Mock data - Top 5 sản phẩm gần kết thúc
  const endingSoonItems = [
    {
      id: 1,
      lotNumber: '576894',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
      title: 'Canvas & culture brush withn elegance auction.',
      currentBid: 9458,
      status: 'live',
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000), // 33 days
      buttonVariant: 'success',
    },
    {
      id: 2,
      lotNumber: '679542',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
      title: 'Illustrate Masterpiece Deluxe Edition of Love skip.',
      startingBid: 2855,
      status: 'upcoming',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
    {
      id: 3,
      lotNumber: '467188',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
      title: 'Vintage Car: Rare Classic Automobiles Up for Bidding',
      currentBid: 50000,
      status: 'live',
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      buttonVariant: 'success',
    },
    {
      id: 4,
      lotNumber: '258967',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      title: 'Zenith Auto Elevating Driving Your Automotive Experience',
      startingBid: 2898,
      status: 'live',
      endDate: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
    {
      id: 5,
      lotNumber: '238964',
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=300&fit=crop',
      title: 'Coin crest cresting the peak of numismatic.',
      currentBid: 5600,
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
    // Thêm items 6, 7 để test carousel
    {
      id: 6,
      lotNumber: '345678',
      image: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400&h=300&fit=crop',
      title: 'Modern Art Collection Limited Edition Print',
      currentBid: 3500,
      status: 'live',
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      buttonVariant: 'success',
    },
    {
      id: 7,
      lotNumber: '789012',
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop',
      title: 'Vintage Watch Collection Rare Timepieces',
      startingBid: 8900,
      status: 'upcoming',
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
  ];

  // Mock data - Top 5 sản phẩm có nhiều lượt ra giá nhất
  const mostBidsItems = [
    {
      id: 6,
      lotNumber: '869458',
      image: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&h=300&fit=crop',
      title: 'Electro edge redefining times possibilities gadget.',
      currentBid: 4053,
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
    {
      id: 7,
      lotNumber: '375934',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      title: 'Nostalgian hookup memories reside in every piece.',
      currentBid: 8690,
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'success',
    },
    {
      id: 8,
      lotNumber: '238964',
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=300&fit=crop',
      title: 'Coin crest cresting the peak of numismatic.',
      currentBid: 5600,
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
    {
      id: 9,
      lotNumber: '687823',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
      title: 'Canvas Celebration Auction Art Spectacular.',
      startingBid: 5237,
      status: 'upcoming',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
    {
      id: 10,
      lotNumber: '375948',
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop',
      title: 'Gizmo galaxy your universent of cutting edge tech.',
      startingBid: 3198,
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
  ];

  // Mock data - Top 5 sản phẩm có giá cao nhất
  const highestPriceItems = [
    {
      id: 11,
      lotNumber: '467188',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
      title: 'Vintage Car: Rare Classic Automobiles Up for Bidding',
      currentBid: 50000,
      status: 'live',
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      buttonVariant: 'success',
    },
    {
      id: 12,
      lotNumber: '576894',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
      title: 'Canvas & culture brush withn elegance auction.',
      currentBid: 9458,
      status: 'live',
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
      buttonVariant: 'success',
    },
    {
      id: 13,
      lotNumber: '375934',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      title: 'Nostalgian hookup memories reside in every piece.',
      currentBid: 8690,
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'success',
    },
    {
      id: 14,
      lotNumber: '238964',
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=300&fit=crop',
      title: 'Coin crest cresting the peak of numismatic.',
      currentBid: 5600,
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
    {
      id: 15,
      lotNumber: '687823',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
      title: 'Canvas Celebration Auction Art Spectacular.',
      startingBid: 5237,
      status: 'upcoming',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      buttonVariant: 'dark',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Top 5 sản phẩm gần kết thúc */}
      <AuctionSection
        subtitle="⏰ ENDING SOON"
        title="Last Chance to Bid"
        items={endingSoonItems}
        showFilter={false}
        itemsPerView={5}
        className="bg-slate-50"
      />

      {/* Top 5 sản phẩm có nhiều lượt ra giá nhất */}
      <AuctionSection
        subtitle="🔥 TRENDING NOW"
        title="Most Popular Auctions"
        items={mostBidsItems}
        showFilter={false}
        itemsPerView={5}
        className="bg-white"
      />

      {/* Top 5 sản phẩm có giá cao nhất */}
      <AuctionSection
        subtitle="💎 PREMIUM COLLECTION"
        title="Highest Value Items"
        items={highestPriceItems}
        showFilter={false}
        itemsPerView={5}
        className="bg-slate-50"
      />

      {/* Testimonial Section */}
      <TestimonialSection />
    </div>
  );
};

export default Home;
