// Guided-walkthrough steps. `target` matches a [data-tour="..."] element.
// `advanceOn` makes a step interactive — it won't continue until the user does
// the action (the named app-state value changes). Steps without it are coach
// marks you dismiss with "Next".
export const TOUR_STEPS = [
  {
    id: "welcome",
    center: true,
    title: "Welcome to your Nike",
    body: "This homepage rebuilds itself around each athlete's training data. Take 30 seconds — I'll show you how it works.",
    cta: "Start tour",
  },
  {
    id: "profile",
    target: "profile",
    title: "This is your athlete",
    body: "Every athlete has different Run Club and Nike.com history. Switch to another athlete to watch the whole feed change.",
    advanceOn: "profile",
    hint: "Pick a different name to continue",
    placement: "bottom",
  },
  {
    id: "toggle",
    target: "toggle",
    title: "Personalisation, on or off",
    body: "On, you get this athlete's own feed. Off, everyone sees the same top-rated catalog. Give it a click.",
    advanceOn: "toggle",
    hint: "Flip the switch to continue",
    placement: "bottom",
  },
  {
    id: "hero",
    target: "hero",
    title: "Your briefing",
    body: "This headline and the stats below it are generated from the athlete's distance, current shoe mileage, and goal — not a fixed banner.",
    placement: "bottom",
  },
  {
    id: "reason",
    target: "reason",
    title: "Why this product",
    body: "Every card explains, in plain language, why it was picked for this athlete. No black box.",
    placement: "top",
  },
  {
    id: "why",
    target: "why",
    title: "See the data behind it",
    body: "Open this anytime to see exactly which signals built the feed — and to turn personalisation off.",
    placement: "bottom",
  },
  {
    id: "done",
    center: true,
    title: "You're all set",
    body: "Explore the feed, switch athletes, and watch the recommendations and reasons change. You can replay this tour anytime from the top bar.",
    cta: "Explore my feed",
  },
];
