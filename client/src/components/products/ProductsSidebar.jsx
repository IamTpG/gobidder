import React, { useState } from "react";
import Input from "../common/Input";

const ProductsSidebar = ({
  searchValue,
  onSearchChange,
  categories = [],
  isLoadingCategories = false,
  selectedCategoryId,
  onCategoryChange,
  className = "",
}) => {
  const [expandedParents, setExpandedParents] = useState(new Set());

  const toggleParent = (parentId) => {
    setExpandedParents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  return (
    <aside
      className={`w-full lg:w-72 border max-h-[500px] overflow-y-hidden border-slate-200 rounded-3xl p-6 bg-white shadow-sm ${className}`}
    >
      <Input
        placeholder="Search"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        fullWidth
      />

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">
          Category
        </h3>
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {isLoadingCategories ? (
            <div className="text-sm text-slate-500 py-2">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-slate-500 py-2">
              No categories available
            </div>
          ) : (
            categories.map((parent) => {
              // Others không hiển thị sub-category
              const isOthers = parent.name.toLowerCase() === "others";
              const hasChildren =
                !isOthers && parent.children && parent.children.length > 0;
              const isExpanded = expandedParents.has(parent.id);
              const isParentSelected = selectedCategoryId === String(parent.id);

              return (
                <div key={parent.id} className="flex flex-col">
                  {/* Parent Category */}
                  <div className="flex items-center gap-2">
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleParent(parent.id)}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
                    )}
                    {!hasChildren && <div className="w-5" />}
                    <label className="flex items-center gap-3 flex-1 text-sm text-slate-700 hover:text-slate-900 cursor-pointer transition-colors font-medium">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                        checked={isParentSelected}
                        onChange={() => onCategoryChange(String(parent.id))}
                      />
                      <span>{parent.name}</span>
                    </label>
                  </div>

                  {/* Children Categories */}
                  {hasChildren && isExpanded && (
                    <div className="ml-7 mt-1 flex flex-col gap-2 border-l-2 border-slate-200 pl-3">
                      {parent.children.map((child) => {
                        const isChildSelected =
                          selectedCategoryId === String(child.id);
                        return (
                          <label
                            key={child.id}
                            className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-primary focus:ring-primary"
                              checked={isChildSelected}
                              onChange={() =>
                                onCategoryChange(String(child.id))
                              }
                            />
                            <span>{child.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};

export default ProductsSidebar;
