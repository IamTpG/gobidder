import React from "react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import {
  ProductsSidebar,
  ProductsHeader,
  ProductsToolbar,
  ProductGrid,
  ProductCardSkeleton,
  EmptyState,
  ErrorState,
} from "../components/products";
import Pagination from "../shared/Pagination";

const ProductsPage = () => {
  const {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    startResult,
    endResult,
    categoryId,
    sort,
    q,
    handlePageChange,
    handleCategoryChange,
    handleSortChange,
    handleSearchChange,
  } = useProducts();

  // Fetch categories từ API
  const { categories, isLoading: categoriesLoading } = useCategories();

  return (
    <div className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col gap-6 sm:gap-8">
          <ProductsHeader
            title="All Auctions"
            subtitle="Find premium lots curated for collectors & connoisseurs."
          />

          <div className="flex flex-col lg:flex-row gap-10">
            <ProductsSidebar
              searchValue={q}
              onSearchChange={handleSearchChange}
              categories={categories}
              isLoadingCategories={categoriesLoading}
              selectedCategoryId={categoryId}
              onCategoryChange={handleCategoryChange}
            />

            <section className="flex-1">
              <ProductsToolbar
                startResult={startResult}
                endResult={endResult}
                totalItems={totalItems}
                sort={sort}
                onSortChange={handleSortChange}
              />

              {isLoading && <ProductCardSkeleton count={6} />}

              {!isLoading && error && <ErrorState message={error} />}

              {!isLoading && !error && products.length === 0 && <EmptyState />}

              {!isLoading && !error && products.length > 0 && (
                <>
                  <ProductGrid products={products} />
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                  />
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
