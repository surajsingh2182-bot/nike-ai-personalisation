import { useEffect, useState, useCallback } from "react";
import { nikeApi } from "./api/nikeApi";
import { useRecommendations } from "./hooks/useRecommendations";
import Swoosh from "./components/Swoosh";
import ProfileSelector from "./components/ProfileSelector";
import PersonalisationToggle from "./components/PersonalisationToggle";
import AthleteBriefing from "./components/AthleteBriefing";
import RecommendationGrid from "./components/RecommendationGrid";
import UserProfilePanel from "./components/UserProfilePanel";
import ExplainabilityModal from "./components/ExplainabilityModal";

const DEBUG =
  new URLSearchParams(window.location.search).get("debug") === "true";

function CardSkeleton() {
  return (
    <div className="card">
      <div className="card-media aspect-square animate-pulse" />
      <div className="pt-3.5 space-y-2">
        <div className="h-4 bg-grey-light rounded w-3/4" />
        <div className="h-4 bg-grey-light rounded w-1/2" />
        <div className="h-4 bg-grey-light rounded w-1/4" />
      </div>
    </div>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path
        d="M7 8V6.5a5 5 0 0110 0V8m-12 0h14l-1 12H6L5 8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [personalised, setPersonalised] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [backendState, setBackendState] = useState("warming");

  useEffect(() => {
    let cancelled = false;
    async function connect() {
      for (let attempt = 0; attempt < 20 && !cancelled; attempt++) {
        try {
          await nikeApi.health();
          const list = await nikeApi.listUsers();
          if (cancelled) return;
          setUsers(list);
          setSelectedUserId(list[0]?.user_id ?? null);
          setBackendState("ready");
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 2500));
        }
      }
      if (!cancelled) setBackendState("down");
    }
    connect();
    return () => {
      cancelled = true;
    };
  }, []);

  const { profile, data, loading } = useRecommendations(
    backendState === "ready" ? selectedUserId : null,
    personalised
  );

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const recommendations = data?.recommendations || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Utility strip */}
      <div className="bg-grey-light text-grey">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-10 h-9 flex items-center justify-between text-[0.78rem]">
          <span className="hidden sm:inline">AI Personalisation · prototype</span>
          {backendState === "ready" && (
            <div className="flex items-center gap-4 ml-auto">
              <button
                type="button"
                className="hover:text-ink"
                onClick={() => setModalOpen(true)}
              >
                Why am I seeing this?
              </button>
              <span className="text-line" aria-hidden>|</span>
              <button
                type="button"
                className="hover:text-ink"
                onClick={() => setDrawerOpen(true)}
              >
                Athlete card
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main header */}
      <header className="bg-paper sticky top-0 z-30 border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-10 h-16 flex items-center justify-between gap-3">
          <Swoosh className="text-ink w-14 shrink-0" />

          {backendState === "ready" && (
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <ProfileSelector
                users={users}
                value={selectedUserId}
                onChange={(id) => {
                  setSelectedUserId(id);
                  setDrawerOpen(false);
                }}
              />
              <PersonalisationToggle on={personalised} onChange={setPersonalised} />
              <button
                type="button"
                aria-label="Bag"
                className="text-ink hover:text-grey"
                onClick={() => showToast("Your bag is coming soon!")}
              >
                <BagIcon />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Warming / down */}
      {backendState !== "ready" && (
        <div className="grow flex items-center justify-center px-6 py-24">
          <div className="text-center max-w-md">
            <Swoosh className="text-ink w-16 mx-auto mb-5" />
            {backendState === "warming" ? (
              <>
                <h1 className="nike-display nike-italic text-4xl">Warming up</h1>
                <p className="text-grey mt-3">
                  Waking the recommendation engine. On the free hosting tier the
                  first request after a quiet spell can take ~30 seconds.
                </p>
              </>
            ) : (
              <>
                <h1 className="nike-display nike-italic text-4xl">
                  Can't reach the engine
                </h1>
                <p className="text-grey mt-3">
                  The backend didn't respond. If it's hosted on a free tier it
                  may still be starting — give it a moment and reload.
                </p>
                <button
                  type="button"
                  className="btn btn-dark mt-6"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main */}
      {backendState === "ready" && (
        <main className="grow">
          <AthleteBriefing
            profile={profile}
            weatherNote={data?.weather_note}
            coldStart={data?.cold_start}
            personalised={personalised}
            onWhy={() => setModalOpen(true)}
          />

          <section className="mx-auto max-w-[1400px] px-5 sm:px-10 py-10">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-9">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <RecommendationGrid
                recommendations={recommendations}
                debug={DEBUG}
                onAddToCart={() => showToast("Your bag is coming soon!")}
              />
            )}
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-ink text-white mt-auto">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <p className="eyebrow text-white/50 mb-3">The demo</p>
            <ul className="space-y-2 text-white/80">
              <li>Personalised feed</li>
              <li>Full catalog</li>
              <li>Athlete profiles</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-white/50 mb-3">How it works</p>
            <ul className="space-y-2 text-white/80">
              <li>Content-based filtering</li>
              <li>Collaborative filtering</li>
              <li>Shoe-replacement rule</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-white/50 mb-3">Built with</p>
            <ul className="space-y-2 text-white/80">
              <li>FastAPI · scikit-learn</li>
              <li>React · Vite · Tailwind</li>
              <li>Open-Meteo</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-white/50 mb-3">Note</p>
            <p className="text-white/60">
              Prototype with dummy data. Not affiliated with Nike, Inc.
            </p>
          </div>
        </div>
        <div className="border-t border-white/15">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-10 py-5 flex items-center gap-3 text-white/50 text-xs">
            <Swoosh className="text-white w-10" />
            <span>· AI Personalisation Engine</span>
          </div>
        </div>
      </footer>

      {/* Overlays */}
      {drawerOpen && (
        <UserProfilePanel profile={profile} onClose={() => setDrawerOpen(false)} />
      )}
      {modalOpen && (
        <ExplainabilityModal
          profile={profile}
          onClose={() => setModalOpen(false)}
          onTurnOff={() => {
            setPersonalised(false);
            setModalOpen(false);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-white px-6 py-3 rounded-full font-medium text-sm shadow-xl rise"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
