import { useEffect, useState, useCallback } from "react";
import { nikeApi } from "./api/nikeApi";
import { useRecommendations } from "./hooks/useRecommendations";
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
    <div className="card animate-pulse">
      <div className="aspect-square bg-surface" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-surface rounded w-1/3" />
        <div className="h-4 bg-surface rounded w-3/4" />
        <div className="h-4 bg-surface rounded w-1/4" />
        <div className="h-8 bg-surface rounded-full mt-2" />
      </div>
    </div>
  );
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [personalised, setPersonalised] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [backendState, setBackendState] = useState("warming"); // warming | ready | down

  // Wake + reach the backend (Render free tier can cold-start ~30s, OQ-3).
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
      {/* Header */}
      <header className="bg-ink-deep sticky top-0 z-30">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="wordmark text-white text-2xl">Nike</span>
            <span className="hidden lg:inline text-white/35 text-xs eyebrow border-l border-white/15 pl-3">
              AI Personalisation
            </span>
          </div>

          {backendState === "ready" && (
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              <ProfileSelector
                users={users}
                value={selectedUserId}
                onChange={(id) => {
                  setSelectedUserId(id);
                  setDrawerOpen(false);
                }}
              />
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="hidden sm:inline eyebrow text-white/70 hover:text-white"
              >
                Athlete card
              </button>
              <PersonalisationToggle
                on={personalised}
                onChange={setPersonalised}
              />
            </div>
          )}
        </div>
      </header>

      {/* Backend warming / down states */}
      {backendState !== "ready" && (
        <div className="grow flex items-center justify-center px-6 py-24">
          <div className="text-center max-w-md">
            {backendState === "warming" ? (
              <>
                <div className="wordmark text-orange text-3xl animate-pulse">
                  Warming up
                </div>
                <p className="text-muted mt-3">
                  Waking the recommendation engine. On the free hosting tier
                  the first request after a quiet spell can take ~30 seconds.
                </p>
              </>
            ) : (
              <>
                <div className="wordmark text-ink text-3xl">
                  Can't reach the engine
                </div>
                <p className="text-muted mt-3">
                  The backend didn't respond. If it's hosted on a free tier it
                  may still be starting — give it a moment and reload.
                </p>
                <button
                  type="button"
                  className="btn-cart mt-5"
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

          <section className="mx-auto max-w-[1280px] px-5 sm:px-8 py-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <RecommendationGrid
                recommendations={recommendations}
                debug={DEBUG}
                onAddToCart={() => showToast("Cart coming soon!")}
              />
            )}
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-surface border-t border-line">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 py-6 text-xs text-muted flex flex-wrap gap-x-6 gap-y-1 justify-between">
          <span>
            Prototype · dummy data only · not affiliated with Nike, Inc.
          </span>
          <span>
            Hybrid recommender: content-based + collaborative filtering ·
            scikit-learn
          </span>
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-white px-5 py-3 rounded-full font-bold text-sm shadow-xl rise"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
