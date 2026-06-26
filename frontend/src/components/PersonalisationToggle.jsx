// ON/OFF switch for personalisation. Orange when ON, ON by default.
export default function PersonalisationToggle({ on, onChange }) {
  return (
    <div data-tour="toggle" className="flex items-center gap-2.5">
      <span className="text-sm text-ink hidden md:inline">Personalised</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Toggle personalisation"
        className="switch"
        data-on={on}
        onClick={() => onChange(!on)}
      />
    </div>
  );
}
