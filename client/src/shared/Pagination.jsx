import React, { useMemo } from "react";

const Pagination = ({ page, totalPages, onChange }) => {
  const visiblePages = useMemo(() => {
    if (!totalPages || totalPages <= 1) return [];

    const maxVisible = 3;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, start + maxVisible - 1);

    const adjustedStart = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: maxVisible }, (_, i) => adjustedStart + i);
  }, [page, totalPages]);

  if (!totalPages || totalPages <= 1) return null;

  const goPrev = () => onChange(Math.max(1, page - 1));
  const goNext = () => onChange(Math.min(totalPages, page + 1));
  const firstVisible = visiblePages[0] ?? 1;
  const lastVisible = visiblePages[visiblePages.length - 1] ?? totalPages;

  const buttonBase =
    "w-10 h-10 rounded-full border text-sm font-medium transition flex items-center justify-center";

  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      <button
        type="button"
        onClick={goPrev}
        disabled={page === 1}
        className={`${buttonBase} border-slate-200 text-slate-500 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Previous page"
      >
        <svg
          className="w-4 h-4"
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

      {firstVisible > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            className={`${buttonBase} border-slate-200 text-slate-600 hover:border-primary hover:text-primary`}
          >
            1
          </button>
          {firstVisible > 2 && (
            <span className="text-slate-400 text-sm">...</span>
          )}
        </>
      )}

      {visiblePages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`${buttonBase} ${
            p === page
              ? "bg-primary border-primary text-white"
              : "border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
          }`}
          aria-current={p === page ? "page" : undefined}
        >
          {p.toString().padStart(2, "0")}
        </button>
      ))}

      {lastVisible < totalPages && (
        <>
          {lastVisible < totalPages - 1 && (
            <span className="text-slate-400 text-sm">...</span>
          )}
          <button
            type="button"
            onClick={() => onChange(totalPages)}
            className={`${buttonBase} border-slate-200 text-slate-600 hover:border-primary hover:text-primary`}
          >
            {totalPages.toString().padStart(2, "0")}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={goNext}
        disabled={page === totalPages}
        className={`${buttonBase} border-slate-200 text-slate-500 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Next page"
      >
        <svg
          className="w-4 h-4"
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
    </div>
  );
};

export default Pagination;
