import React from 'react';
import { Button } from '../common';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#F5E6D3] via-[#F8EDE0] to-[#FAF0E6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center py-8 lg:py-12">
          {/* Left Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm mb-3 border border-slate-200">
              <span className="text-sm">⏰</span>
              <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wide">BIDDING OUR</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-3 leading-[1.1]">
              Select Your{' '}
              <span className="text-primary italic font-serif">Best Bid Product</span>{' '}
              At Our Auction.
            </h1>

            {/* Description */}
            <p className="text-sm text-slate-600 mb-5 leading-relaxed max-w-lg">
              Join us as we carve a path to success, driven by passion, powered by innovation, and we're here to turn them into reality.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="primary" 
                size="lg"
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
              >
                Start A Bid
                <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-5 py-2 bg-white border-2 border-slate-900 text-slate-900 rounded-lg font-semibold hover:bg-slate-900 hover:text-white transition-all duration-300 text-sm"
              >
                View All Auction
              </Button>
            </div>
          </div>

          {/* Right Side - Image Grid */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-2.5 relative z-10">
              {/* Top Left - Vases */}
              <div className="rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=200&fit=crop" 
                  alt="Antique Vases"
                  className="w-full h-28 object-cover"
                />
              </div>

              {/* Top Right - Watches */}
              <div className="rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop" 
                  alt="Vintage Watches"
                  className="w-full h-28 object-cover"
                />
              </div>

              {/* Bottom Left - Gramophone */}
              <div className="rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&h=200&fit=crop" 
                  alt="Vintage Gramophone"
                  className="w-full h-28 object-cover"
                />
              </div>

              {/* Bottom Right - Classic Art */}
              <div className="rounded-lg overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=300&h=200&fit=crop" 
                  alt="Classic Art"
                  className="w-full h-28 object-cover"
                />
              </div>

              {/* Center - Car */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 rounded-lg overflow-hidden shadow-xl w-3/4 z-20">
                <img 
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop" 
                  alt="Luxury Car"
                  className="w-full h-24 object-cover"
                />
              </div>
            </div>

            {/* Decorative circle */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-200/30 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Background Pattern - Vertical text */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 origin-left hidden xl:block">
        <div className="text-[60px] font-black text-slate-900/5 tracking-wider whitespace-nowrap">
          BIDDING OUR PRODUCT
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white -z-10" style={{
        clipPath: 'ellipse(100% 100% at 50% 100%)'
      }}></div>
    </section>
  );
};

export default HeroSection;

