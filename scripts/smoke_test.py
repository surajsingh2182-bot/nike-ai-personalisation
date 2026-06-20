"""
Smoke test the recommendation engine against the PRD acceptance criteria.
Run from backend/ so the local imports resolve:  python ../scripts/smoke_test.py
"""

import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from data_loader import get_store          # noqa: E402
from recommender import get_recommender    # noqa: E402

store = get_store()
rec = get_recommender(store)

PASS, FAIL = "PASS", "FAIL"
results = []


def check(label, condition, detail=""):
    results.append((PASS if condition else FAIL, label, detail))


# Find a representative user per profile.
def first_of(profile_type):
    return next(u["user_id"] for u in store.users if u["profile_type"] == profile_type)


road = first_of("high_mileage_road_runner")
hiit = first_of("hiit_strength_trainer")
new = first_of("new_member")

# AC: high-mileage road runner -> successor shoe in top 3.
recs, cold = rec.recommend(road, limit=8)
top3_names = [r["name"] for r in recs[:3]]
check(f"[{road}] successor Pegasus 41 in top 3",
      any("Pegasus 41" in n for n in top3_names), str(top3_names))
check(f"[{road}] shoe_replacement reason present",
      any(r["reason_type"] == "shoe_replacement" for r in recs))
check(f"[{road}] returns 8 recs", len(recs) == 8)

# AC: HIIT trainer -> training shoes appear, road running shoes do not.
recs_h, _ = rec.recommend(hiit, limit=8)
cats_h = [r["category"] for r in recs_h]
check(f"[{hiit}] training shoes present", "training_shoes" in cats_h, str(set(cats_h)))
check(f"[{hiit}] NO road running shoes", "road_running_shoes" not in cats_h, str(set(cats_h)))

# AC: cold-start new member -> >=6 recs, cold_start flag, cold_start reasons.
recs_n, cold_n = rec.recommend(new, limit=8)
check(f"[{new}] cold_start flagged True", cold_n is True)
check(f"[{new}] >= 6 recommendations", len(recs_n) >= 6, f"got {len(recs_n)}")
check(f"[{new}] cold_start reason copy", all(
    r["reason_type"] in ("cold_start", "shoe_replacement") for r in recs_n))

# AC: every rec has a non-empty reason.
all_ok = True
for u in store.users:
    r, _ = rec.recommend(u["user_id"], limit=8)
    if not all(x["reason"] and x["reason"].strip() for x in r):
        all_ok = False
        break
check("Every product across all 50 users has a non-empty reason", all_ok)

# AC: fitness-level never violated.
violation = None
for u in store.users:
    activity = store.get_activity(u["user_id"])
    level = activity["ntc"]["fitness_level"]
    r, _ = rec.recommend(u["user_id"], limit=8)
    for x in r:
        prod = store.get_product(x["product_id"])
        if level not in prod["fitness_level"]:
            violation = (u["user_id"], x["name"], level, prod["fitness_level"])
            break
    if violation:
        break
check("No product violates the user's fitness level", violation is None, str(violation))

# AC: road vs trail produce visibly different recs.
trailish = None
for u in store.users:
    if store.get_activity(u["user_id"])["nrc"]["preferred_surface"] == "trail":
        trailish = u["user_id"]
        break
if trailish:
    r_road, _ = rec.recommend(road, limit=8)
    r_trail, _ = rec.recommend(trailish, limit=8)
    overlap = set(x["product_id"] for x in r_road) & set(x["product_id"] for x in r_trail)
    check(f"road [{road}] vs trail [{trailish}] recs differ",
          len(overlap) < 8, f"{len(overlap)}/8 overlap")

# Performance: recommend latency.
t0 = time.time()
rec.recommend(road, limit=8)
elapsed = (time.time() - t0) * 1000
check(f"recommend latency < 2000ms ({elapsed:.1f}ms)", elapsed < 2000)

print("\n=== SMOKE TEST RESULTS ===")
for status, label, detail in results:
    line = f"  [{status}] {label}"
    if status == FAIL and detail:
        line += f"  -> {detail}"
    print(line)

failures = sum(1 for s, _, _ in results if s == FAIL)
print(f"\n{len(results) - failures}/{len(results)} passed, {failures} failed")
sys.exit(1 if failures else 0)
