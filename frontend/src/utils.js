// Shared formatting + mapping helpers.

export function formatINR(value) {
  if (value == null) return "";
  return "₹" + value.toLocaleString("en-IN");
}

export function titleCase(str) {
  return (str || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Collapse the 7 catalog categories into the 3 filter buckets (P1-4).
export function categoryBucket(category) {
  if (category.endsWith("_shoes")) return "shoes";
  if (category === "accessories") return "accessories";
  return "apparel";
}

export const FILTERS = [
  { key: "all", label: "All" },
  { key: "shoes", label: "Shoes" },
  { key: "apparel", label: "Apparel" },
  { key: "accessories", label: "Accessories" },
];

// Visual identity per recommendation reason type.
export function reasonChip(reasonType) {
  switch (reasonType) {
    case "shoe_replacement":
      return { label: "Time to replace", tone: "orange" };
    case "collaborative":
      return { label: "Athletes like you", tone: "dark" };
    case "content":
      return { label: "Your match", tone: "dark" };
    case "cold_start":
      return { label: "Your preferences", tone: "dark" };
    case "top_rated":
      return { label: "Top rated", tone: "muted" };
    default:
      return { label: "Recommended", tone: "muted" };
  }
}

// Category-specific accent colours for the local SVG placeholder tiles
// (PRD OQ-4: colour-coding by category makes the demo more readable). Kept
// in-app so the demo never depends on a third-party image host being up.
export const CATEGORY_COLOR = {
  road_running_shoes: "#fa5400",
  trail_running_shoes: "#2e7d32",
  training_shoes: "#1565c0",
  running_apparel_top: "#7b3fe4",
  running_apparel_bottom: "#00838f",
  training_apparel: "#c2185b",
  accessories: "#5d4037",
};

export function stars(rating) {
  const full = Math.round(rating);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}
