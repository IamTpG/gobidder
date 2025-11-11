import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import AuctionSection from '../components/sections/AuctionSection';
import TestimonialSection from '../components/sections/TestimonialSection';

// Helper function to calculate time left
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

const Home = () => {
  // Mock data - Top 5 sản phẩm gần kết thúc
  const endingSoonItems = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
      title: 'Canvas & culture brush withn elegance auction.',
      currentBid: 9458,
      buyNowPrice: 12000,
      highestBidder: 'John Doe',
      bidCount: 15,
      createdAt: '2024-11-01T10:30:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000), // 33 days
      timeLeft: calculateTimeLeft(new Date(Date.now() + 33 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'success',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
      title: 'Illustrate Masterpiece Deluxe Edition of Love skip.',
      startingBid: 2855,
      bidCount: 0,
      createdAt: '2024-11-05T14:20:00Z',
      status: 'upcoming',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
      title: 'Vintage Car: Rare Classic Automobiles Up for Bidding',
      currentBid: 50000,
      buyNowPrice: 75000,
      highestBidder: 'Sarah Johnson',
      bidCount: 42,
      createdAt: '2024-10-28T09:15:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'success',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      title: 'Zenith Auto Elevating Driving Your Automotive Experience',
      startingBid: 2898,
      highestBidder: 'Mike Chen',
      bidCount: 8,
      createdAt: '2024-11-03T16:45:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 48 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=300&fit=crop',
      title: 'Coin crest cresting the peak of numismatic.',
      currentBid: 5600,
      buyNowPrice: 8500,
      highestBidder: 'Emma Wilson',
      bidCount: 23,
      createdAt: '2024-10-30T11:00:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
    // Thêm items 6, 7 để test carousel
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400&h=300&fit=crop',
      title: 'Modern Art Collection Limited Edition Print',
      currentBid: 3500,
      highestBidder: 'Alex Brown',
      bidCount: 12,
      createdAt: '2024-11-02T13:30:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'success',
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop',
      title: 'Vintage Watch Collection Rare Timepieces',
      startingBid: 8900,
      buyNowPrice: 15000,
      bidCount: 0,
      createdAt: '2024-11-06T08:00:00Z',
      status: 'upcoming',
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
  ];

  // Mock data - Top 5 sản phẩm có nhiều lượt ra giá nhất
  const mostBidsItems = [
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&h=300&fit=crop',
      title: 'Electro edge redefining times possibilities gadget.',
      currentBid: 4053,
      buyNowPrice: 6000,
      highestBidder: 'David Lee',
      bidCount: 67,
      createdAt: '2024-10-25T12:00:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      title: 'Nostalgian hookup memories reside in every piece.',
      currentBid: 8690,
      highestBidder: 'Lisa Smith',
      bidCount: 54,
      createdAt: '2024-10-27T15:30:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'success',
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=300&fit=crop',
      title: 'Coin crest cresting the peak of numismatic.',
      currentBid: 5600,
      buyNowPrice: 8500,
      highestBidder: 'Emma Wilson',
      bidCount: 48,
      createdAt: '2024-10-29T10:00:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
    {
      id: 11,
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
      title: 'Canvas Celebration Auction Art Spectacular.',
      startingBid: 5237,
      highestBidder: 'Tom Anderson',
      bidCount: 39,
      createdAt: '2024-10-26T14:15:00Z',
      status: 'upcoming',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
    {
      id: 12,
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop',
      title: 'Gizmo galaxy your universent of cutting edge tech.',
      startingBid: 3198,
      highestBidder: 'Rachel Green',
      bidCount: 31,
      createdAt: '2024-10-31T09:45:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
  ];

  // Mock data - Top 5 sản phẩm có giá cao nhất
  const highestPriceItems = [
    {
      id: 13,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
      title: 'Vintage Car: Rare Classic Automobiles Up for Bidding',
      currentBid: 50000,
      buyNowPrice: 75000,
      highestBidder: 'Sarah Johnson',
      bidCount: 42,
      createdAt: '2024-10-28T09:15:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'success',
    },
    {
      id: 14,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
      title: 'Canvas & culture brush withn elegance auction.',
      currentBid: 9458,
      buyNowPrice: 12000,
      highestBidder: 'John Doe',
      bidCount: 15,
      createdAt: '2024-11-01T10:30:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 33 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'success',
    },
    {
      id: 15,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      title: 'Nostalgian hookup memories reside in every piece.',
      currentBid: 8690,
      highestBidder: 'Lisa Smith',
      bidCount: 54,
      createdAt: '2024-10-27T15:30:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'success',
    },
    {
      id: 16,
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=300&fit=crop',
      title: 'Coin crest cresting the peak of numismatic.',
      currentBid: 5600,
      buyNowPrice: 8500,
      highestBidder: 'Emma Wilson',
      bidCount: 23,
      createdAt: '2024-10-30T11:00:00Z',
      status: 'live',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
      buttonVariant: 'dark',
    },
    {
      id: 17,
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
      title: 'Canvas Celebration Auction Art Spectacular.',
      startingBid: 5237,
      highestBidder: 'Tom Anderson',
      bidCount: 18,
      createdAt: '2024-10-26T14:15:00Z',
      status: 'upcoming',
      endDate: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      timeLeft: calculateTimeLeft(new Date(Date.now() + 53 * 24 * 60 * 60 * 1000)),
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
