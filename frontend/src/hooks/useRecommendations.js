import { useEffect, useState } from "react";
import { nikeApi } from "../api/nikeApi";

// Fetches the full profile + recommendation payload for a user, re-fetching
// whenever the selected user or the personalisation toggle changes.
export function useRecommendations(userId, personalised) {
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, recRes] = await Promise.all([
          nikeApi.getUser(userId),
          nikeApi.recommend(userId, { personalised }),
        ]);
        if (cancelled) return;
        setProfile(profileRes);
        setData(recRes);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, personalised]);

  return { profile, data, loading, error };
}
