import { titleCase } from "../utils";

// THE signature element: the user's training data delivered like a coach's
// pre-run briefing. This is the thesis of the whole product — "we read your
// body and your wallet, and we connected them."
function Stat({ label, value, children }) {
  return (
    <div className="flex-1 min-w-[120px] px-5 first:pl-0">
      <div className="stat-num text-3xl sm:text-4xl text-white">{value}</div>
      <div className="eyebrow text-white/45 mt-1.5">{label}</div>
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
  // Personalisation OFF — quiet, honest full-catalog bar.
  if (!personalised) {
    return (
      <section className="bg-surface border-y border-line">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 py-7">
          <p className="eyebrow text-muted">Personalisation off</p>
          <h1 className="display text-2xl sm:text-3xl mt-2">
            Showing the full catalog — top rated products
          </h1>
          <p className="text-muted text-sm mt-2 max-w-xl">
            Every athlete sees the same grid, ranked only by rating. Flip
            personalisation back on to see this athlete's own feed.
          </p>
        </div>
      </section>
    );
  }

  const nrc = profile?.nrc_summary || {};
  const firstName = (profile?.name || "").split(" ")[0];
  const shoeKm = nrc.current_shoe_km;
  const replaceDue = typeof shoeKm === "number" && shoeKm > 400;
  const shoePct = Math.min(((shoeKm || 0) / 500) * 100, 100);

  let headline;
  if (coldStart) {
    headline = `Welcome, ${firstName}. Let's find your fit.`;
  } else if (replaceDue) {
    headline = `${shoeKm} km in. Time to talk shoes.`;
  } else {
    headline = `${nrc.total_km ?? 0} km this year. Here's what's next.`;
  }

  return (
    <section className="bg-ink-deep text-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 pt-9 pb-8">
        <span className="chip bg-orange/15 text-orange ring-1 ring-orange/40">
          <span aria-hidden>🏃</span>
          {coldStart
            ? "New member · based on your stated preferences"
            : "Based on your NRC + Nike.com activity"}
        </span>

        <h1 className="display text-[2rem] leading-[0.95] sm:text-[3.25rem] mt-4 max-w-3xl">
          {headline}
        </h1>

        {/* Stat strip — the readout */}
        <div className="mt-7 flex flex-wrap gap-y-6 divide-x divide-white/10">
          <Stat label="KM this year" value={nrc.total_km ?? "—"} />
          <Stat
            label={replaceDue ? "On your current shoe" : "Current shoe"}
            value={shoeKm != null ? `${shoeKm}` : "—"}
          >
            {shoeKm != null && (
              <div className="mt-2 w-[88%]">
                <div className="h-1.5 rounded-full bg-white/12 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange transition-[width] duration-500"
                    style={{ width: `${shoePct}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[0.6rem] uppercase tracking-wider">
                  {replaceDue ? (
                    <span className="text-orange font-bold">
                      Replace soon · 500 km
                    </span>
                  ) : (
                    <span className="text-white/40">of ~500 km lifespan</span>
                  )}
                </div>
              </div>
            )}
          </Stat>
          <Stat label="Runs / week" value={nrc.runs_per_week ?? "—"} />
          <Stat
            label="Training for"
            value={
              <span className="text-2xl sm:text-3xl">
                {titleCase(nrc.current_goal) || "—"}
              </span>
            }
          />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={onWhy}
            className="text-orange text-sm font-semibold underline underline-offset-4 decoration-orange/50 hover:decoration-orange"
          >
            Why am I seeing this?
          </button>
          {weatherNote && (
            <span className="text-white/55 text-sm">· {weatherNote}</span>
          )}
        </div>
      </div>
    </section>
  );
}
