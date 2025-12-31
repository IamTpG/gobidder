import React from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";

const ChevronUp = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M6 15l6-6 6 6" />
  </svg>
);

const Footer = () => {
  const { categories } = useCategories();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      className="
        relative mt-28 overflow-hidden text-slate-800
        before:content-[''] before:absolute before:inset-0 before:-z-10
        before:bg-gradient-to-br before:from-[#18A5A7] before:via-[#5fd7c0] before:to-[#BFFFC7]
      "
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_380px_at_50%_0%,rgba(236,245,241,0.9),rgba(255,255,255,0))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 -z-10 h-56 w-[1600px] -translate-x-1/2 rounded-b-[80px] bg-gradient-to-b from-[#f0f7f3] to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 gap-12 border-slate-200/70 pt-16 md:grid-cols-2 lg:grid-cols-3">
          {/* Cột trái: Logo + slogan */}
          <div className="lg:col-span-1">
            <div className="flex items-end gap-3">
              <div className="text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                  GO
                </span>
                <span className="inline-block rounded-md bg-slate-900 px-2 py-1 ml-1 text-white">
                  BIDDER
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-700/90">
              Bid High, Win Big, Smile Bigger
            </p>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Your trusted platform for premium auctions. Discover unique items
              and place your bids with confidence.
            </p>
          </div>

          {/* Cột giữa: Categories */}
          <div className="lg:col-span-1">
            <h4 className="relative text-xl font-bold tracking-wide pb-3 mb-4 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-16 after:rounded-full after:bg-gradient-to-r after:from-[#01AA85] after:to-transparent">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {categories && categories.length > 0 ? (
                categories.slice(0, 8).map((category) => (
                  <li
                    key={category.id}
                    className="transition-all duration-300 hover:translate-x-1"
                  >
                    <Link
                      className="transition hover:text-primary inline-block"
                      to={`/products?categoryId=${category.id}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">No categories available</li>
              )}
            </ul>
          </div>

          {/* Cột phải: Payment Gateways */}
          <div className="lg:col-span-1">
            <h4 className="relative text-xl font-bold tracking-wide pb-3 mb-4 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-16 after:rounded-full after:bg-gradient-to-r after:from-[#01AA85] after:to-transparent">
              Payment
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              We accept secure payments through trusted gateways
            </p>
            <div className="flex items-center">
              <img
                src="https://probid-wp.egenstheme.com/multipurpose-auction/wp-content/uploads/sites/12/2024/11/payment-trans.png"
                alt="Payment Gateways"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200/80 pt-6" />

        <div className="flex flex-col items-center justify-center gap-2 pb-8 text-sm text-slate-700">
          <p className="text-center">
            ©Copyright 2024{" "}
            <span className="font-semibold text-slate-900">GoBidder</span>. All
            rights reserved.
          </p>
        </div>
      </div>

      <button
        onClick={scrollTop}
        className="fixed bottom-6 right-6 grid h-12 w-12 place-items-center rounded-full border border-slate-300 bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:shadow-xl"
        aria-label="Back to top"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </footer>
  );
};

export default Footer;
