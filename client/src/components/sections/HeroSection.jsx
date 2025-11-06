import React from 'react';
import { Button } from '../common';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <span className="text-2xl">👋</span>
            <span className="text-sm font-medium text-slate-700">BIDDING OUR</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight">
            Discover unique items and bid on your favorites
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl">
            Join thousands of bidders in exciting auctions. Find rare collectibles, 
            vintage treasures, and one-of-a-kind items from around the world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="primary" 
              size="lg"
              className="px-8"
            >
              Start Bidding
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8"
            >
              Browse Auctions
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-slate-200">
            <div>
              <div className="text-3xl font-bold text-slate-900">10K+</div>
              <div className="text-sm text-slate-600">Active Auctions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">50K+</div>
              <div className="text-sm text-slate-600">Happy Bidders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">$2M+</div>
              <div className="text-sm text-slate-600">Items Sold</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

export default HeroSection;
