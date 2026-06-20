"""
Trace one user end-to-end: raw data  ->  feature vector  ->  content matches
->  similar users (collaborative)  ->  final scored recommendations.

This is a learning/inspection tool. It shows exactly how a user's stored data
maps into the recommendations they receive.

Run from the backend/ folder so the imports resolve:
    cd backend
    ../.venv/Scripts/python.exe ../scripts/explain_user.py USR_001
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import numpy as np                                      # noqa: E402
from sklearn.metrics.pairwise import cosine_similarity  # noqa: E402

from data_loader import get_store                        # noqa: E402
from recommender import (                                # noqa: E402
    get_recommender, SURFACES, GOALS, FITNESS, CATEGORIES,
)

FEATURE_LABELS = (
    [f"surface:{s}" for s in SURFACES]
    + [f"goal:{g}" for g in GOALS]
    + [f"fitness:{f}" for f in FITNESS]
    + [f"cat:{c}" for c in CATEGORIES]
)


def rule(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def main(user_id):
    store = get_store()
    rec = get_recommender(store)

    user = store.get_user(user_id)
    if user is None:
        print(f"No such user: {user_id}")
        return
    activity = store.get_activity(user_id)
    inter = store.get_interactions(user_id)

    # ---- 1. RAW INPUTS -------------------------------------------------
    rule(f"1. RAW DATA FOR {user_id}  ({user['name']}, {user['city']})")
    print(f"profile type : {user['profile_label']}")
    print(f"membership   : {user['membership_tier']}")
    nrc, ntc = activity["nrc"], activity["ntc"]
    print("\nNike Run Club (activity.json):")
    print(f"  total_km_logged   : {nrc['total_km_logged']}")
    print(f"  preferred_surface : {nrc['preferred_surface']}")
    print(f"  current_goal      : {nrc['current_goal']}")
    print(f"  current_shoe      : {nrc.get('current_shoe_name')} @ {nrc['current_shoe_km']} km")
    print(f"  runs_per_week_avg : {nrc['runs_per_week_avg']}")
    print("Nike Training Club:")
    print(f"  fitness_level     : {ntc['fitness_level']}")
    print(f"  workouts_per_week : {ntc['workouts_per_week_avg']}")
    print("\nNike.com (interactions.json):")
    print(f"  purchases         : {[p['product_name'] for p in inter['purchase_history']]}")
    print(f"  browsed           : {[b['product_id'] for b in inter['browse_history']]}")
    print(f"  preferred_categories: {inter['preferred_categories']}")
    n_inter = store.interaction_count(user_id)
    print(f"  total interactions: {n_inter}  ->  {'COLD START' if n_inter < 3 else 'has enough history'}")

    # ---- 2. FEATURE VECTOR ---------------------------------------------
    rule("2. THESE SIGNALS BECOME A NUMERIC FEATURE VECTOR")
    vec = rec.build_user_vector(user_id)[0]
    print("Only the non-zero features (the rest are 0):")
    for label, value in zip(FEATURE_LABELS, vec):
        if value != 0:
            print(f"  {label:28s} = {value}")

    # ---- 3. CONTENT MATCH ----------------------------------------------
    rule("3. CONTENT MATCH: cosine similarity of user vs every product")
    sims = cosine_similarity(vec.reshape(1, -1), rec.product_matrix)[0]
    order = np.argsort(sims)[::-1]
    print("Top 8 products purely by attribute match (before collaborative):")
    for i in order[:8]:
        p = store.products[rec.product_ids[i]] if False else rec.products[i]
        print(f"  {sims[i]:.3f}  {p['name']:28s} [{p['category']}]")

    # ---- 4. COLLABORATIVE: similar users -------------------------------
    rule("4. COLLABORATIVE: members most similar to this one")
    if n_inter < 3:
        print("Skipped — cold-start user (< 3 interactions). Content-only recs.")
    else:
        row = rec.interaction_matrix[rec._user_index[user_id]].reshape(1, -1)
        dist, idx = rec.knn.kneighbors(row, n_neighbors=min(6, len(rec.user_order)))
        for d, j in zip(dist[0], idx[0]):
            other = rec.user_order[j]
            if other == user_id:
                continue
            bought = [p["product_name"]
                      for p in (store.get_interactions(other) or {}).get("purchase_history", [])]
            print(f"  similarity {1 - d:.3f}  {other} ({store.get_user(other)['profile_label']})")
            print(f"      bought: {bought}")

    # ---- 5. FINAL RECOMMENDATIONS --------------------------------------
    rule("5. FINAL RECOMMENDATIONS  (0.4*content + 0.6*collaborative)")
    results, cold = rec.recommend(user_id, limit=8)
    for r in results:
        print(f"  {r['name']:28s} [{r['category']}]")
        print(f"      content_sim={r['similarity_score']}  final={r['final_score']}  type={r['reason_type']}")
        print(f"      reason: {r['reason']}")


if __name__ == "__main__":
    uid = sys.argv[1] if len(sys.argv) > 1 else "USR_001"
    main(uid)
