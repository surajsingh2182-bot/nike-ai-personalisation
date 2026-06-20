import { formatINR, titleCase, reasonChip, stars } from "../utils";
import ProductImage from "./ProductImage";

const CHIP_TONE = {
  orange: "bg-orange text-white",
  dark: "bg-ink text-white",
  muted: "bg-surface text-muted",
};

export default function ProductCard({ product, debug, onAddToCart }) {
  const isReplacement = product.reason_type === "shoe_replacement";
  const chip = reasonChip(product.reason_type);

  return (
    <article className={`card ${isReplacement ? "card--replace" : ""}`}>
      {isReplacement && (
        <div className="bg-orange text-white text-center py-1 eyebrow">
          Time to replace your shoes
        </div>
      )}

      <div className="relative bg-surface">
        <ProductImage name={product.name} category={product.category} />
        <div className="absolute top-2 left-2 flex gap-1.5">
          {product.is_new && (
            <span className="chip bg-orange text-white">New</span>
          )}
        </div>
        {!isReplacement && (
          <span
            className={`chip absolute top-2 right-2 ${CHIP_TONE[chip.tone]}`}
          >
            {chip.label}
          </span>
        )}
      </div>

      <div className="p-3.5 flex flex-col gap-1.5 grow">
        <p className="eyebrow text-muted text-[0.62rem]">
          {titleCase(product.category)}
        </p>
        <h3 className="font-bold text-[0.95rem] leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-orange tracking-tight" aria-hidden>
            {stars(product.avg_rating)}
          </span>
          <span className="text-muted">{product.avg_rating.toFixed(1)}</span>
        </div>

        <div className="font-extrabold text-[1.05rem] mt-0.5">
          {formatINR(product.price_inr)}
        </div>

        {/* Explainability — every card, every time (P0-5) */}
        <p className="reason">{product.reason}</p>

        {debug && product.similarity_score != null && (
          <p className="text-[0.6rem] text-muted font-mono mt-0.5">
            sim {product.similarity_score} · final {product.final_score}
          </p>
        )}

        <button
          type="button"
          className="btn-cart mt-2.5"
          onClick={() => onAddToCart(product)}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
