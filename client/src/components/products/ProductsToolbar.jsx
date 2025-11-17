import React, { useState, useRef, useEffect } from "react";

const ProductsToolbar = ({
  startResult,
  endResult,
  totalItems,
  sort,
  onSortChange,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: "created_at", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "end_time_asc", label: "Ending: Soon to Late" },
    { value: "end_time_desc", label: "Ending: Late to Soon" },
  ];

  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <p className="text-sm text-slate-500">
        Showing {startResult}-{endResult} of {totalItems} Results
      </p>

      {/* Custom Select */}
      <div ref={dropdownRef} className="relative w-[220px]">
        <button
          onClick={() => setOpen(!open)}
          className="
            w-full flex items-center justify-between rounded-3xl
            bg-white border border-slate-300 px-4 py-2.5
            text-sm font-medium text-slate-700 shadow-sm
            hover:border-primary transition-all duration-200
          "
        >
          {options.find((o) => o.value === sort)?.label}

          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div
            className="
              absolute mt-1 w-full rounded-2xl bg-white shadow-lg border 
              border-slate-200 overflow-hidden z-20
            "
          >
            {options.map((o) => (
              <div
                key={o.value}
                onClick={() => {
                  onSortChange(o.value);
                  setOpen(false);
                }}
                className="
                  px-4 py-2.5 text-sm cursor-pointer 
                  hover:bg-primary/10 hover:text-primary 
                  transition-all duration-150
                "
              >
                {o.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsToolbar;
