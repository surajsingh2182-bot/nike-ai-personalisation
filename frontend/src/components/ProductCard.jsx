import { formatINR, titleCase } from "../utils";
import ProductImage from "./ProductImage";

export default function ProductCard({ product, debug, onAddToCart }) {
  const isReplacement = product.reason_type === "shoe_replacement";

  return (
    <article className={`card ${isReplacement ? "card--replace" : ""}`}>
      <div className="card-media">
        <ProductImage name={product.name} category={product.category} />
        {isReplacement && (
          <span className="absolute top-3 left-3 eyebrow bg-orange text-white px-2 py-1">
            Replace soon
          </span>
        )}
        <div className="absolute bottom-3 right-3 left-3 flex justify-end">
          <button
            type="button"
            className="card-cart btn btn-dark text-sm"
            onClick={() => onAddToCart(product)}
          >
            Add to bag
          </button>
        </div>
      </div>

      <div className="pt-3.5 flex flex-col gap-0.5">
        {product.is_new && (
          <span className="text-orange font-medium text-[0.95rem] leading-tight">
            Just In
          </span>
        )}
        <h3 className="font-medium text-[1rem] leading-tight text-ink">
          {product.name}
        </h3>
        <p className="text-grey text-[1rem] leading-tight">
          {titleCase(product.category)}
        </p>
        <div className="flex items-center gap-2 text-grey text-[0.85rem] mt-0.5">
          <span aria-hidden>★</span>
          <span>{product.avg_rating.toFixed(1)}</span>
        </div>
        <div className="font-medium text-[1rem] mt-1.5 text-ink">
          MRP : {formatINR(product.price_inr)}
        </div>

        {/* The AI-personalisation layer: why this product, for this athlete */}
        <p className="reason mt-2 pl-2.5 border-l-2 border-orange">
          {product.reason}
        </p>

        {debug && product.similarity_score != null && (
          <p className="text-[0.7rem] text-grey font-mono mt-1">
            sim {product.similarity_score} · final {product.final_score}
          </p>
        )}
      </div>
    </article>
  );
}
