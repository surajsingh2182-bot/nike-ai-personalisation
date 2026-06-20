import { titleCase } from "../utils";

// "Viewing as: <name> ▾" dropdown listing all 50 dummy users grouped by
// profile type so the demo is easy to navigate.
export default function ProfileSelector({ users, value, onChange }) {
  const grouped = users.reduce((acc, u) => {
    (acc[u.profile_label] ||= []).push(u);
    return acc;
  }, {});

  return (
    <label className="flex items-center gap-2 text-white/90 cursor-pointer">
      <span className="eyebrow text-white/60 hidden md:inline">Viewing as</span>
      <span className="relative flex items-center">
        <select
          className="select-native max-w-[40vw] sm:max-w-[240px] truncate"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Select athlete profile"
        >
          {Object.entries(grouped).map(([label, group]) => (
            <optgroup key={label} label={label}>
              {group.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name} · {u.city}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none -ml-3 text-orange">
          ▾
        </span>
      </span>
    </label>
  );
}
