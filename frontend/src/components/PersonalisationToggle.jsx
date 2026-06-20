// ON/OFF switch for personalisation. Orange when ON (PRD), ON by default.
export default function PersonalisationToggle({ on, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="eyebrow text-white/70 hidden sm:inline">
        Personalised for you
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Toggle personalisation"
        className="switch"
        data-on={on}
        onClick={() => onChange(!on)}
      />
      <span className="eyebrow text-white w-7">{on ? "On" : "Off"}</span>
    </div>
  );
}
