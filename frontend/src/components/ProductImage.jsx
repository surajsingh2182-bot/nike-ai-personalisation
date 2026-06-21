import { CATEGORY_COLOR, titleCase } from "../utils";

// Real studio photos for shoes (distributed across a small pool so the grid
// isn't repetitive) and tops; a clean named tile for everything else. Bundled
// locally (frontend/public/products) so they load instantly and reliably.
const SHOE_POOL = [
  "shoe-1.jpg", "shoe-2.jpg", "shoe-3.jpg", "shoe-4.jpg", "shoe-5.jpg",
];
const TOP_PHOTO = "top-1.jpg";

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function photoFor(name, category) {
  if (category.endsWith("_shoes")) {
    return SHOE_POOL[hash(name) % SHOE_POOL.length];
  }
  if (category === "running_apparel_top") return TOP_PHOTO;
  return null;
}

export default function ProductImage({ name, category }) {
  const photo = photoFor(name, category);

  if (photo) {
    return (
      <img
        src={`/products/${photo}`}
        alt={name}
        loading="lazy"
        className="w-full aspect-square object-cover"
      />
    );
  }

  // Clean named tile (apparel bottoms, training apparel, accessories).
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
      <rect x="0" y="0" width="600" height="10" fill={accent} />
      <text
        x="44"
        y="96"
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
        y="128"
        fill={accent}
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="700"
        fontSize="15"
        letterSpacing="2"
      >
        {titleCase(category).toUpperCase()}
      </text>
      <text
        x="44"
        y="510"
        fill="#111111"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="48"
        letterSpacing="-1"
      >
        {display}
      </text>
    </svg>
  );
}
