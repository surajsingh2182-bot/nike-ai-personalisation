// "Viewing as <name> ▾" dropdown listing all 50 dummy users grouped by
// profile type so the demo is easy to navigate.
export default function ProfileSelector({ users, value, onChange }) {
  const grouped = users.reduce((acc, u) => {
    (acc[u.profile_label] ||= []).push(u);
    return acc;
  }, {});

  return (
    <label data-tour="profile" className="flex items-center gap-2 cursor-pointer min-w-0">
      <span className="text-grey text-sm hidden md:inline">Viewing as</span>
      <span className="relative flex items-center">
        <select
          className="select-native max-w-[42vw] sm:max-w-[240px] truncate"
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
        <span aria-hidden className="pointer-events-none -ml-3 text-ink">
          ▾
        </span>
      </span>
    </label>
  );
}
