import { useEffect } from "react";
import { titleCase } from "../utils";

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-line">
      <span className="eyebrow text-muted">{label}</span>
      <span className="font-bold text-sm text-right">{value ?? "—"}</span>
    </div>
  );
}

function WeatherCard({ weather }) {
  if (!weather) return null;
  const unavailable = weather.condition === "unavailable";
  return (
    <div className="rounded-lg bg-ink text-white p-4 mt-5">
      <p className="eyebrow text-white/50">Now in {weather.city}</p>
      {unavailable ? (
        <p className="text-white/70 text-sm mt-2">
          Live weather unavailable right now.
        </p>
      ) : (
        <div className="flex items-end justify-between mt-1">
          <div className="stat-num text-3xl">
            {weather.temperature_c}
            <span className="text-lg align-top">°C</span>
          </div>
          <div className="text-right">
            <p className="font-bold capitalize">{weather.condition}</p>
            {weather.humidity != null && (
              <p className="text-white/50 text-xs">
                {weather.humidity}% humidity
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserProfilePanel({ profile, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!profile) return null;
  const nrc = profile.nrc_summary || {};
  const ntc = profile.ntc_summary || {};

  return (
    <>
      <div className="backdrop" onClick={onClose} aria-hidden />
      <aside
        className="drawer fixed top-0 right-0 z-50 h-full w-full max-w-[360px] bg-paper shadow-2xl overflow-y-auto"
        role="dialog"
        aria-label={`${profile.name} athlete profile`}
      >
        <div className="bg-ink text-white p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="eyebrow text-orange">{profile.profile_label}</p>
              <h2 className="display text-2xl mt-1">{profile.name}</h2>
              <p className="text-white/60 text-sm mt-1">
                {profile.city} · {titleCase(profile.membership_tier)} member
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className="text-white/70 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>
          {profile.cold_start && (
            <p className="chip bg-orange/20 text-orange ring-1 ring-orange/40 mt-3">
              New member · preference-based recs
            </p>
          )}
        </div>

        <div className="p-5">
          <p className="eyebrow text-ink mb-1">Nike Run Club</p>
          <Row label="Total km" value={nrc.total_km} />
          <Row
            label="Current shoe"
            value={
              nrc.current_shoe_name
                ? `${nrc.current_shoe_name} · ${nrc.current_shoe_km} km`
                : "—"
            }
          />
          <Row label="Runs / week" value={nrc.runs_per_week} />
          <Row label="Preferred surface" value={titleCase(nrc.preferred_surface)} />
          <Row label="Current goal" value={titleCase(nrc.current_goal)} />
          <Row label="Run streak" value={nrc.streak_days ? `${nrc.streak_days} days` : "—"} />

          <p className="eyebrow text-ink mb-1 mt-6">Nike Training Club</p>
          <Row label="Workouts / week" value={ntc.workouts_per_week} />
          <Row label="Fitness level" value={titleCase(ntc.fitness_level)} />

          {profile.last_purchase && (
            <>
              <p className="eyebrow text-ink mb-1 mt-6">Nike.com</p>
              <Row label="Last purchase" value={profile.last_purchase} />
            </>
          )}

          <WeatherCard weather={profile.weather} />
        </div>
      </aside>
    </>
  );
}
