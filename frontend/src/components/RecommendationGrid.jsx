import { useState } from "react";
import ProductCard from "./ProductCard";
import { FILTERS, categoryBucket } from "../utils";

export default function RecommendationGrid({ recommendations, debug, onAddToCart }) {
  const [filter, setFilter] = useState("all");

  const visible =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => categoryBucket(r.category) === filter);

  // Only show a filter if at least one recommendation falls in it.
  const available = FILTERS.filter(
    (f) =>
      f.key === "all" ||
      recommendations.some((r) => categoryBucket(r.category) === f.key)
  );

  return (
    <div>
      <div className="flex items-center gap-5 border-b border-line mb-5 overflow-x-auto">
        {available.map((f) => (
          <button
            key={f.key}
            type="button"
            className="tab whitespace-nowrap"
            data-active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted text-sm py-10 text-center">
          Nothing in this category for this athlete. Try another filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((product, i) => (
            <div
              key={product.product_id}
              className="rise"
              style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
            >
              <ProductCard
                product={product}
                debug={debug}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
