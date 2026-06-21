import { useEffect } from "react";

const LAYERS = [
  {
    title: "We read your training",
    body: "Your Nike Run Club and Nike Training Club activity — distance, surface, goal, fitness level — becomes a single profile of how you actually train.",
  },
  {
    title: "We match it to the catalog",
    body: "That profile is compared against every product's attributes, narrowing 80 products down to a relevant shortlist for you.",
  },
  {
    title: "We rank by athletes like you",
    body: "Within that shortlist, we rank using what members with similar training and buying patterns chose — unless you're new, when we lean on your stated preferences.",
  },
];

export default function ExplainabilityModal({ profile, onClose, onTurnOff }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const signals = profile?.data_signals || [];

  return (
    <>
      <div className="backdrop" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How Nike personalises your feed"
          className="bg-paper rounded-lg max-w-lg w-full max-h-[88vh] overflow-y-auto rise"
        >
          <div className="p-6 flex justify-between items-start border-b border-line">
            <h2 className="nike-display text-2xl max-w-xs">
              How Nike personalises your feed
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-grey hover:text-ink text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            <ol className="space-y-5">
              {LAYERS.map((layer, i) => (
                <li key={layer.title} className="flex gap-4">
                  <span className="stat-num text-orange text-xl shrink-0 w-6">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-[1rem]">{layer.title}</h3>
                    <p className="text-grey text-sm mt-1">{layer.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {signals.length > 0 && (
              <div className="mt-6 bg-grey-light rounded-lg p-4">
                <p className="eyebrow text-ink mb-2">Your data used</p>
                <ul className="space-y-1.5">
                  {signals.map((s) => (
                    <li key={s} className="text-sm flex gap-2">
                      <span className="text-orange" aria-hidden>✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={onTurnOff}
              className="btn btn-dark w-full mt-6"
            >
              Turn off personalisation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
