import { titleCase } from "../utils";
import HeroCarousel from "./HeroCarousel";

// THE signature: a Nike campaign hero — full-bleed image carousel behind a
// headline that's generated from the athlete's own training data.
function Stat({ label, value, children }) {
  return (
    <div className="px-5 sm:px-7 border-l border-line first:border-l-0">
      <div className="stat-num text-2xl sm:text-3xl text-ink">{value}</div>
      <div className="eyebrow text-grey mt-1.5 font-medium">{label}</div>
      {children}
    </div>
  );
}

export default function AthleteBriefing({
  profile,
  weatherNote,
  coldStart,
  personalised,
  onWhy,
}) {
  const nrc = profile?.nrc_summary || {};
  const firstName = (profile?.name || "").split(" ")[0];
  const shoeKm = nrc.current_shoe_km;
  const replaceDue = typeof shoeKm === "number" && shoeKm > 400;
  const shoePct = Math.min(((shoeKm || 0) / 500) * 100, 100);

  let eyebrow, line1, line2;
  if (!personalised) {
    eyebrow = "The full catalog";
    line1 = "Top rated.";
    line2 = "Right now.";
  } else if (coldStart) {
    eyebrow = "New member · based on your stated preferences";
    line1 = `Welcome, ${firstName}.`;
    line2 = "Let's find your fit.";
  } else if (replaceDue) {
    eyebrow = "Personalised for you · NRC + Nike.com";
    line1 = `${shoeKm} km in.`;
    line2 = "Time to talk shoes.";
  } else {
    eyebrow = "Personalised for you · NRC + Nike.com";
    line1 = `${nrc.total_km ?? 0} km this year.`;
    line2 = "Here's what's next.";
  }

  return (
    <section>
      {/* Image-carousel hero */}
      <div className="relative min-h-[58vh] flex items-center justify-center overflow-hidden">
        <HeroCarousel />
        {/* legibility scrim */}
        <div
          className="absolute inset-0 bg-black/45"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"
          aria-hidden
        />

        <div className="relative z-10 text-center px-5 py-16 on-image">
          <p className="eyebrow text-orange">{eyebrow}</p>
          <h1 className="nike-display nike-italic text-white text-[2.6rem] leading-[0.92] sm:text-7xl mt-3">
            {line1}
            <br />
            {line2}
          </h1>
          {personalised && (
            <div className="mt-7">
              <button type="button" onClick={onWhy} className="btn btn-light">
                Why am I seeing this?
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data readout strip (personalised only) */}
      {personalised ? (
        <div className="bg-grey-light">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-10 py-6 flex flex-wrap gap-y-5 justify-center sm:justify-between items-start">
            <Stat label="KM this year" value={nrc.total_km ?? "—"} />
            <Stat
              label={replaceDue ? "On your shoe" : "Current shoe"}
              value={shoeKm != null ? `${shoeKm}` : "—"}
            >
              {shoeKm != null && (
                <div className="mt-2 w-28">
                  <div className="h-1 rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange transition-[width] duration-500"
                      style={{ width: `${shoePct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[0.62rem] uppercase tracking-wide font-bold">
                    {replaceDue ? (
                      <span className="text-orange">Replace soon · 500 km</span>
                    ) : (
                      <span className="text-grey">of ~500 km</span>
                    )}
                  </div>
                </div>
              )}
            </Stat>
            <Stat label="Runs / week" value={nrc.runs_per_week ?? "—"} />
            <Stat
              label="Training for"
              value={
                <span className="text-xl sm:text-2xl">
                  {titleCase(nrc.current_goal) || "—"}
                </span>
              }
            />
          </div>
          {weatherNote && (
            <p className="text-center text-grey text-sm pb-5 px-5">{weatherNote}</p>
          )}
        </div>
      ) : (
        <div className="bg-grey-light">
          <p className="mx-auto max-w-md text-center text-grey text-sm px-5 py-6">
            Every athlete sees the same grid — ranked only by rating. Turn
            personalisation on to see this athlete's own feed.
          </p>
        </div>
      )}
    </section>
  );
}
