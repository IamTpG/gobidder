import React, { useState } from 'react';

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-testimonial hover:shadow-xl transition-all duration-300 h-full flex flex-col animate-slideUp">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/10 hover:ring-primary/30 transition-all duration-300"
          />
          <div>
            <h4 className="text-lg font-bold text-slate-800 hover:text-primary transition-colors duration-300">{testimonial.name}</h4>
            <p className="text-sm text-slate-500">{testimonial.position}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300">
            {testimonial.tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-600 leading-relaxed flex-grow">
        {testimonial.content}
      </p>
    </div>
  );
};

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Penelope Gianna',
      position: 'CEO at Probid',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      tag: 'Fantastic Bidding Item!',
      content: 'Feel free to customize the key features based on the services and strategies you offer in each plan. This breakdown helps potential clients understand the specific value they\'ll receive at each pricing tier.',
    },
    {
      id: 2,
      name: 'Mr. Daniel Scoot',
      position: 'CEO at Probid',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      tag: 'Great Auction Product!',
      content: 'Feel free to customize the key features based on the services and strategies you offer in each plan. This breakdown helps potential clients understand the specific value they\'ll receive at each pricing tier.',
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      position: 'Art Collector',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      tag: 'Amazing Experience!',
      content: 'The auction platform is incredibly user-friendly and transparent. I\'ve successfully won several bids and the process was seamless from start to finish. Highly recommend to any serious collector!',
    },
    {
      id: 4,
      name: 'Michael Chen',
      position: 'Vintage Car Dealer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      tag: 'Professional Service!',
      content: 'As a seller, I appreciate the comprehensive tools and analytics provided. The platform has helped me reach a wider audience and achieve better prices for my vintage automobiles.',
    },
  ];

  // Calculate how many cards to show based on screen size
  const itemsPerPage = 2;
  const maxIndex = Math.max(0, testimonials.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-primary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">
              TESTIMONIAL
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              Customer <span className="text-slate-500">Stories</span>
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentIndex === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-primary text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:scale-105'
              }`}
              aria-label="Previous testimonials"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                currentIndex >= maxIndex
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-primary text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:scale-105'
              }`}
              aria-label="Next testimonials"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Brands Section - "We Worked With Global Largest Trusted Brand" */}
        <div className="mb-16 text-center">
          <p className="text-slate-700 text-sm mb-8 font-medium">We Worked With Global Largest Trusted Brand</p>
          <div className="flex flex-wrap items-center justify-center gap-16 transition-all duration-500">
            <div className="opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110">
              <svg className="h-10 w-auto" viewBox="0 0 120 40" fill="none">
                <text x="10" y="25" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#64748b">
                  ❤️ Scooby
                </text>
              </svg>
            </div>
            <div className="opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110">
              <svg className="h-10 w-auto" viewBox="0 0 120 40" fill="none">
                <text x="10" y="25" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#64748b">
                  📷 PicsZen
                </text>
              </svg>
            </div>
            <div className="opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110">
              <svg className="h-10 w-auto" viewBox="0 0 140 40" fill="none">
                <text x="10" y="25" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#64748b">
                  🅿️ ParkPlace
                </text>
              </svg>
            </div>
            <div className="opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110">
              <svg className="h-10 w-auto" viewBox="0 0 120 40" fill="none">
                <text x="10" y="25" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#64748b">
                  💄 Beautico
                </text>
              </svg>
            </div>
            <div className="opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-110">
              <svg className="h-10 w-auto" viewBox="0 0 120 40" fill="none">
                <text x="10" y="25" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#64748b">
                  ▲ Aploxn
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
