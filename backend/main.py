"""
Nike AI Personalization Engine - FastAPI backend (PRD section 10).

Endpoints:
  GET /api/health            - uptime check
  GET /api/users             - profile-selector list (all 50 dummy users)
  GET /api/user/{id}         - full profile + activity summary
  GET /api/recommend/{id}    - personalised recommendations with reasons
  GET /api/products          - full catalog (personalisation-off view)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from data_loader import get_store
from explainability import data_signals_used
from recommender import get_recommender
from weather import get_weather

VERSION = "1.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Build the data store + ML models once, and warm the weather cache for
    # every distinct city so /api/recommend never blocks on a cold call.
    store = get_store()
    get_recommender(store)
    seen = set()
    for user in store.users:
        if user["city"] in seen:
            continue
        seen.add(user["city"])
        get_weather(user["city"], user["latitude"], user["longitude"])
    yield


app = FastAPI(title="Nike AI Personalization Engine", version=VERSION, lifespan=lifespan)

# Public read-only demo: allow any origin so the Vercel frontend (and local
# dev) can call the API without per-deploy origin configuration.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": VERSION}


@app.get("/api/users")
def list_users():
    store = get_store()
    return [
        {
            "user_id": u["user_id"],
            "name": u["name"],
            "city": u["city"],
            "membership_tier": u["membership_tier"],
            "profile_type": u["profile_type"],
            "profile_label": u["profile_label"],
        }
        for u in store.users
    ]


@app.get("/api/user/{user_id}")
def get_user(user_id: str):
    store = get_store()
    user = store.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    activity = store.get_activity(user_id)
    inter = store.get_interactions(user_id) or {}
    nrc = activity["nrc"]
    ntc = activity["ntc"]
    purchases = inter.get("purchase_history", [])
    last_purchase = purchases[0]["product_name"] if purchases else None
    cold_start = store.interaction_count(user_id) < 3

    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "city": user["city"],
        "membership_tier": user["membership_tier"],
        "profile_type": user["profile_type"],
        "profile_label": user["profile_label"],
        "nikeplus_since": user["nikeplus_since"],
        "nrc_summary": {
            "total_km": nrc.get("total_km_logged"),
            "current_shoe_km": nrc.get("current_shoe_km"),
            "current_shoe_name": nrc.get("current_shoe_name"),
            "runs_per_week": nrc.get("runs_per_week_avg"),
            "preferred_surface": nrc.get("preferred_surface"),
            "current_goal": nrc.get("current_goal"),
            "streak_days": nrc.get("streak_days"),
        },
        "ntc_summary": {
            "workouts_per_week": ntc.get("workouts_per_week_avg"),
            "fitness_level": ntc.get("fitness_level"),
        },
        "last_purchase": last_purchase,
        "data_signals": data_signals_used(user, activity),
        "weather": get_weather(user["city"], user["latitude"], user["longitude"]),
        "cold_start": cold_start,
    }


@app.get("/api/recommend/{user_id}")
def recommend(
    user_id: str,
    limit: int = Query(8, ge=1, le=20),
    personalised: bool = Query(True),
):
    store = get_store()
    user = store.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    weather = get_weather(user["city"], user["latitude"], user["longitude"])

    if not personalised:
        # Full-catalog view: top N by avg_rating, identical for every user.
        top = sorted(store.products, key=lambda p: p["avg_rating"], reverse=True)[:limit]
        recommendations = [
            {
                "product_id": p["product_id"],
                "name": p["name"],
                "category": p["category"],
                "price_inr": p["price_inr"],
                "image_url": p["image_url"],
                "avg_rating": p["avg_rating"],
                "reason": "Top rated across the full Nike catalog",
                "reason_type": "top_rated",
                "similarity_score": None,
                "final_score": None,
                "is_new": p.get("is_new", False),
            }
            for p in top
        ]
        return {
            "user_id": user_id,
            "cold_start": False,
            "personalised": False,
            "weather_context": weather,
            "weather_note": None,
            "recommendations": recommendations,
        }

    recommender = get_recommender(store)
    recommendations, cold_start = recommender.recommend(user_id, limit=limit)

    weather_note = None
    if weather.get("is_wet"):
        weather_note = (
            f"It's {weather['condition']} in {weather['city']} right now — "
            f"weatherproof and trail-ready gear surfaced higher."
        )
    elif weather.get("condition") == "humid":
        weather_note = (
            f"Humid in {weather['city']} today — sweat-wicking, breathable "
            f"fabrics are prioritised."
        )

    return {
        "user_id": user_id,
        "cold_start": cold_start,
        "personalised": True,
        "weather_context": weather,
        "weather_note": weather_note,
        "recommendations": recommendations,
    }


@app.get("/api/products")
def list_products(
    category: str | None = Query(None),
    limit: int = Query(80, ge=1, le=200),
):
    store = get_store()
    products = store.products
    if category:
        products = [p for p in products if p["category"] == category]
    return products[:limit]
