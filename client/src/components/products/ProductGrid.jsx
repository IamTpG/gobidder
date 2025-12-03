import React from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../common/ProductCard";

const ProductGrid = ({ products }) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
      {products.map((p) => {
        return (
          <ProductCard
            key={p.id}
            {...p}
            onClick={() => navigate(`/products/${p.id}`)}
            onBid={() => console.log("Bid on:", p.name || p.title)}
          />
        );
      })}
    </div>
  );
};

export default ProductGrid;
