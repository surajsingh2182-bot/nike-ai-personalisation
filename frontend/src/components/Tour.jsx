import { useEffect, useRef, useState } from "react";
import { TOUR_STEPS } from "../tour/steps";
import { roughEllipsePath } from "../tour/rough";

const PAD = 12; // spotlight padding around the target

export default function Tour({ run, appState, onClose }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const baseline = useRef(null);

  const step = TOUR_STEPS[index];
  const isLast = index === TOUR_STEPS.length - 1;

  // (Re)start at the beginning whenever the tour is launched.
  useEffect(() => {
    if (run) setIndex(0);
  }, [run]);

  // Track the target element's position for the current step.
  useEffect(() => {
    if (!run || !step || step.center) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const id = setInterval(update, 200);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [run, index, step]);

  // Capture the baseline value for an interactive step.
  useEffect(() => {
    if (!run || !step) return;
    if (step.advanceOn === "profile") baseline.current = appState.selectedUserId;
    if (step.advanceOn === "toggle") baseline.current = appState.personalised;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, index]);

  // Advance an interactive step once the user performs the action.
  useEffect(() => {
    if (!run || !step?.advanceOn) return;
    const changed =
      (step.advanceOn === "profile" &&
        appState.selectedUserId !== baseline.current) ||
      (step.advanceOn === "toggle" &&
        appState.personalised !== baseline.current);
    if (changed) {
      const t = setTimeout(() => setIndex((i) => Math.min(i + 1, TOUR_STEPS.length - 1)), 450);
      return () => clearTimeout(t);
    }
  }, [appState.selectedUserId, appState.personalised, run, step]);

  // Esc closes the tour.
  useEffect(() => {
    if (!run) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, onClose]);

  if (!run || !step) return null;

  const next = () => (isLast ? onClose() : setIndex((i) => i + 1));
  const progress = `${index + 1} / ${TOUR_STEPS.length}`;

  // ---- Centered step (welcome / done) --------------------------------
  if (step.center) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-5">
        <div className="bg-paper rounded-xl max-w-md w-full p-7 rise text-center">
          <p className="eyebrow text-orange">Guided tour · {progress}</p>
          <h2 className="nike-display nike-italic text-3xl mt-2">{step.title}</h2>
          <p className="text-grey mt-3">{step.body}</p>
          <div className="flex gap-3 justify-center mt-6">
            {index === 0 && (
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Skip
              </button>
            )}
            <button type="button" className="btn btn-dark" onClick={next}>
              {step.cta}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Spotlight step (coach mark) -----------------------------------
  if (!rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Spotlight box
  const box = {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };

  // Hand-drawn ring
  const ringPad = 10;
  const rx = box.width / 2 + ringPad;
  const ry = box.height / 2 + ringPad;
  const ringW = rx * 2 + 16;
  const ringH = ry * 2 + 16;
  const ringLeft = rect.left + rect.width / 2 - ringW / 2;
  const ringTop = rect.top + rect.height / 2 - ringH / 2;

  // Bubble placement
  const bubbleW = Math.min(330, vw - 32);
  const targetCx = rect.left + rect.width / 2;
  const bubbleLeft = Math.max(12, Math.min(targetCx - bubbleW / 2, vw - bubbleW - 12));
  const below = step.placement !== "top" && rect.bottom + 200 < vh;
  const bubbleStyle = below
    ? { top: rect.bottom + 22, left: bubbleLeft }
    : { top: rect.top - 22, left: bubbleLeft, transform: "translateY(-100%)" };
  const caretLeft = Math.max(18, Math.min(targetCx - bubbleLeft, bubbleW - 18));

  return (
    <div className="fixed inset-0 z-[100]" aria-live="polite">
      {/* Spotlight cutout */}
      <div
        className="absolute rounded-xl pointer-events-none transition-all duration-300"
        style={{
          ...box,
          boxShadow: "0 0 0 9999px rgba(17,17,17,0.62)",
        }}
      />

      {/* Hand-drawn ring */}
      <svg
        className="absolute pointer-events-none tour-ring"
        style={{ top: ringTop, left: ringLeft, width: ringW, height: ringH }}
        viewBox={`0 0 ${ringW} ${ringH}`}
        fill="none"
      >
        <g transform={`translate(${ringW / 2}, ${ringH / 2})`}>
          <path
            d={roughEllipsePath(rx, ry, 7)}
            stroke="#fa5400"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Coach-mark bubble */}
      <div
        className="absolute bg-paper rounded-xl shadow-2xl p-4 pointer-events-auto rise"
        style={{ ...bubbleStyle, width: bubbleW }}
        role="dialog"
        aria-label={step.title}
      >
        <span
          className="absolute w-3 h-3 bg-paper rotate-45"
          style={{
            left: caretLeft - 6,
            [below ? "top" : "bottom"]: -6,
          }}
          aria-hidden
        />
        <div className="flex items-center justify-between">
          <p className="eyebrow text-orange">{progress}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-grey hover:text-ink text-sm"
          >
            Skip tour
          </button>
        </div>
        <h3 className="font-bold text-[1.05rem] mt-1.5">{step.title}</h3>
        <p className="text-grey text-sm mt-1">{step.body}</p>

        <div className="flex items-center justify-between mt-3.5">
          {step.advanceOn ? (
            <span className="text-orange text-sm font-medium flex items-center gap-1.5">
              <span className="tour-pulse-dot" /> {step.hint}
            </span>
          ) : (
            <span />
          )}
          {!step.advanceOn && (
            <button type="button" className="btn btn-dark text-sm" onClick={next}>
              {isLast ? "Finish" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
