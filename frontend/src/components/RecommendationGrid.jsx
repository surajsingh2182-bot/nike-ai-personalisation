import { useState } from "react";
import ProductCard from "./ProductCard";
import { FILTERS, categoryBucket } from "../utils";

export default function RecommendationGrid({ recommendations, debug, onAddToCart }) {
  const [filter, setFilter] = useState("all");

  const visible =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => categoryBucket(r.category) === filter);

  const available = FILTERS.filter(
    (f) =>
      f.key === "all" ||
      recommendations.some((r) => categoryBucket(r.category) === f.key)
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        <h2 className="nike-display text-2xl sm:text-3xl">Recommended for you</h2>
        <nav data-tour="filters" className="flex items-center gap-6 overflow-x-auto">
          {available.map((f) => (
            <button
              key={f.key}
              type="button"
              className="navlink"
              data-active={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </nav>
      </div>

      {visible.length === 0 ? (
        <p className="text-grey py-12 text-center">
          Nothing in this category for this athlete. Try another filter.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-9">
          {visible.map((product, i) => (
            <div
              key={product.product_id}
              className="rise"
              style={{ animationDelay: `${Math.min(i * 45, 360)}ms` }}
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
