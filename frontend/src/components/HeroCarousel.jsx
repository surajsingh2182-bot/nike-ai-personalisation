import { useEffect, useState } from "react";

// Full-bleed background carousel for the hero, à la nike.com. Crossfades
// every 6s; honours reduced-motion (holds the first frame). Bundled images
// from public/hero so they load fast and reliably.
const IMAGES = ["/hero/hero-1.jpg", "/hero/hero-2.jpg", "/hero/hero-3.jpg"];
const INTERVAL = 6000;

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % IMAGES.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          aria-hidden
          className="absolute inset-0 bg-center bg-cover transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none"
          style={{ backgroundImage: `url(${src})`, opacity: i === idx ? 1 : 0 }}
        />
      ))}

      {/* Indicator bars */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {IMAGES.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setIdx(i)}
            className="h-1 rounded-full transition-all"
            style={{
              width: i === idx ? 28 : 14,
              background: i === idx ? "#ffffff" : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
