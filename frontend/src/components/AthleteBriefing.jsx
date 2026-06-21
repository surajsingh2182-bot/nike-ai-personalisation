import { titleCase } from "../utils";

// THE signature: a Nike campaign hero whose headline is generated from the
// athlete's own training data. Nike's voice, our AI.
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
  if (!personalised) {
    return (
      <section className="bg-paper text-center px-5 py-14 sm:py-20">
        <p className="eyebrow text-grey">The full catalog</p>
        <h1 className="nike-display nike-italic text-5xl sm:text-7xl mt-3">
          Top rated.
          <br />
          Right now.
        </h1>
        <p className="text-grey mt-4 max-w-md mx-auto">
          Every athlete sees the same grid — ranked only by rating. Turn
          personalisation on to see this athlete's own feed.
        </p>
      </section>
    );
  }

  const nrc = profile?.nrc_summary || {};
  const firstName = (profile?.name || "").split(" ")[0];
  const shoeKm = nrc.current_shoe_km;
  const replaceDue = typeof shoeKm === "number" && shoeKm > 400;
  const shoePct = Math.min(((shoeKm || 0) / 500) * 100, 100);

  let line1, line2;
  if (coldStart) {
    line1 = `Welcome, ${firstName}.`;
    line2 = "Let's find your fit.";
  } else if (replaceDue) {
    line1 = `${shoeKm} km in.`;
    line2 = "Time to talk shoes.";
  } else {
    line1 = `${nrc.total_km ?? 0} km this year.`;
    line2 = "Here's what's next.";
  }

  return (
    <section className="bg-paper">
      {/* Campaign hero */}
      <div className="text-center px-5 pt-12 pb-9 sm:pt-16 sm:pb-12">
        <p className="eyebrow text-orange">
          {coldStart
            ? "New member · based on your stated preferences"
            : "Personalised for you · NRC + Nike.com"}
        </p>
        <h1 className="nike-display nike-italic text-[2.6rem] leading-[0.92] sm:text-7xl mt-3">
          {line1}
          <br />
          {line2}
        </h1>
        <div className="mt-7">
          <button type="button" onClick={onWhy} className="btn btn-ghost">
            Why am I seeing this?
          </button>
        </div>
      </div>

      {/* Data readout strip */}
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
    </section>
  );
}
