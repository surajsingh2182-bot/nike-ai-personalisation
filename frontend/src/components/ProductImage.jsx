import { CATEGORY_COLOR, titleCase } from "../utils";

// Self-contained product tile rendered as inline SVG — no external image host,
// so it loads instantly and works offline. Colour-coded by category (OQ-4).
// The product's short name (without the leading "Nike") is the focal point.
export default function ProductImage({ name, category }) {
  const accent = CATEGORY_COLOR[category] || "#fa5400";
  const shortName = name.replace(/^Nike\s+/, "");

  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full aspect-square block"
      role="img"
      aria-label={name}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="600" height="600" fill="#111111" />
      {/* diagonal accent band */}
      <path d="M0 600 L600 220 L600 600 Z" fill={accent} opacity="0.92" />
      <path d="M0 600 L420 600 L0 360 Z" fill="#000000" opacity="0.18" />

      <text
        x="48"
        y="118"
        fill="#ffffff"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="58"
        letterSpacing="-3"
      >
        NIKE
      </text>
      <text
        x="48"
        y="156"
        fill={accent}
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="17"
        letterSpacing="3"
      >
        {titleCase(category).toUpperCase()}
      </text>

      <text
        x="48"
        y="500"
        fill="#ffffff"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontSize="50"
        letterSpacing="-1"
      >
        {shortName.length > 16 ? shortName.slice(0, 15) + "…" : shortName}
      </text>
    </svg>
  );
}
