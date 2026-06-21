import { CATEGORY_COLOR } from "../utils";

const SWOOSH =
  "M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z";

// Nike-style product tile: a light-grey card with a faint swoosh watermark
// (tinted by category) and the product name set in black. No external image
// host — loads instantly, looks like a Nike grid tile.
export default function ProductImage({ name, category }) {
  const accent = CATEGORY_COLOR[category] || "#111111";
  const shortName = name.replace(/^Nike\s+/, "");
  const display = shortName.length > 18 ? shortName.slice(0, 17) + "…" : shortName;

  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full aspect-square block"
      role="img"
      aria-label={name}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="600" height="600" fill="#f5f5f5" />
      {/* swoosh watermark, tinted by category */}
      <g transform="translate(150 250) scale(13)" fill={accent} opacity="0.16">
        <path d={SWOOSH} />
      </g>
      <text
        x="44"
        y="92"
        fill="#111111"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="700"
        fontSize="24"
        letterSpacing="0.5"
      >
        NIKE
      </text>
      <text
        x="44"
        y="520"
        fill="#111111"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="46"
        letterSpacing="-1"
      >
        {display}
      </text>
    </svg>
  );
}
