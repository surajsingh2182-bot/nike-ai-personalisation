// Tiny helpers to draw "hand-drawn" coach-mark shapes — a wobbly ellipse and
// a sketchy arrow — as SVG path strings. Seeded so a given size is stable.

function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// A slightly irregular ellipse that overshoots its start, like a circle drawn
// by hand. rx/ry are radii; jitter is the radius wobble fraction.
export function roughEllipsePath(rx, ry, seed = 7, segments = 24, jitter = 0.05) {
  const rnd = seeded(seed);
  const start = -0.35;
  const end = Math.PI * 2 + 0.35; // overshoot past the start
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = start + (end - start) * (i / segments);
    const j = 1 + (rnd() * 2 - 1) * jitter;
    pts.push([Math.cos(a) * rx * j, Math.sin(a) * ry * j]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    const mx = (px + x) / 2;
    const my = (py + y) / 2;
    d += ` Q ${px.toFixed(1)} ${py.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d;
}

// A short curved arrow from (x1,y1) toward (x2,y2) with a little arrowhead.
export function roughArrowPath(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // bow the curve perpendicular to the line
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bow = Math.min(40, len * 0.25);
  const cx = mx + nx * bow;
  const cy = my + ny * bow;
  const body = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;

  // arrowhead at the end, angled along the curve's final direction
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const a1 = ang + Math.PI - 0.5;
  const a2 = ang + Math.PI + 0.5;
  const hl = 12;
  const head =
    ` M ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 + Math.cos(a1) * hl).toFixed(1)} ${(y2 + Math.sin(a1) * hl).toFixed(1)}` +
    ` M ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 + Math.cos(a2) * hl).toFixed(1)} ${(y2 + Math.sin(a2) * hl).toFixed(1)}`;
  return body + head;
}
