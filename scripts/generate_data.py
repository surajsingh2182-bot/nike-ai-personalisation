"""
Deterministic dummy-data generator for the Nike AI Personalization Engine.

Produces four JSON files in backend/data/:
  users.json         - 50 NikePlus member profiles (5 behaviour profiles x 10)
  activity.json      - NRC + NTC activity per user
  interactions.json  - Nike.com browse + purchase history per user
  products.json      - 80-product catalog with ML matching attributes

Run:  python scripts/generate_data.py
Seeded so the dataset is identical on every run.
"""

import json
import os
import random
from datetime import date, timedelta

SEED = 42
random.seed(SEED)

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "..", "backend", "data")
os.makedirs(DATA_DIR, exist_ok=True)

# --------------------------------------------------------------------------
# Reference data
# --------------------------------------------------------------------------

CITIES = [
    ("Mumbai", 19.0760, 72.8777),
    ("Delhi", 28.6139, 77.2090),
    ("Bangalore", 12.9716, 77.5946),
    ("Chennai", 13.0827, 80.2707),
    ("Hyderabad", 17.3850, 78.4867),
    ("Pune", 18.5204, 73.8567),
    ("Kolkata", 22.5726, 88.3639),
    ("Ahmedabad", 23.0225, 72.5714),
    ("Jaipur", 26.9124, 75.7873),
    ("Surat", 21.1702, 72.8311),
]

FIRST_NAMES = [
    "Arjun", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Karan", "Isha",
    "Aditya", "Meera", "Siddharth", "Kavya", "Rahul", "Diya", "Aryan", "Nisha",
    "Varun", "Tara", "Dev", "Riya", "Kabir", "Aisha", "Manav", "Pooja",
    "Nikhil", "Sanya", "Yash", "Aarohi", "Ishaan", "Mira", "Reyansh", "Anika",
    "Vivaan", "Saanvi", "Aarav", "Myra", "Kiaan", "Avni", "Ayaan", "Navya",
    "Krishna", "Zara", "Veer", "Ira", "Shaurya", "Kiara", "Atharv", "Pari",
    "Aadi", "Sara",
]

LAST_NAMES = [
    "Mehta", "Sharma", "Patel", "Reddy", "Iyer", "Kapoor", "Nair", "Singh",
    "Gupta", "Rao", "Joshi", "Desai", "Menon", "Chopra", "Bhat", "Verma",
    "Pillai", "Shah", "Kulkarni", "Banerjee",
]

PROFILE_TYPES = {
    "A": "high_mileage_road_runner",
    "B": "casual_jogger",
    "C": "hiit_strength_trainer",
    "D": "multi_sport_athlete",
    "E": "new_member",
}

PROFILE_LABELS = {
    "A": "High Mileage Road Runner",
    "B": "Casual Jogger",
    "C": "HIIT + Strength Trainer",
    "D": "Multi-Sport Athlete",
    "E": "New Member",
}

# --------------------------------------------------------------------------
# Product catalog
# --------------------------------------------------------------------------

# Curated, realistic names per category. The first road shoe (Pegasus 41) is
# the successor to Pegasus 40 -> drives the shoe-replacement trigger.
CATALOG = {
    "road_running_shoes": [
        "Pegasus 41", "Pegasus 40", "Vomero 17", "Structure 25", "Invincible 3",
        "InfinityRN 4", "Vaporfly 3", "Alphafly 3", "Zoom Fly 5", "Pegasus Plus",
        "Rival Fly 3", "Revolution 7", "Downshifter 13", "Winflo 11", "Pegasus Turbo Next",
    ],
    "trail_running_shoes": [
        "Wildhorse 8", "Pegasus Trail 5", "Terra Kiger 9", "Kiger 10", "Juniper Trail 3",
        "Zegama 2", "Wildhorse 9", "Ultrafly Trail", "Terrascout GTX", "Trail Roam",
    ],
    "training_shoes": [
        "Metcon 9", "Free Metcon 6", "Air Zoom SuperRep 3", "Metcon 8", "MC Trainer 3",
        "Renew In-Season 12", "Air Max Alpha 5", "Legend Essential 3", "Flex Control 4", "SuperRep Go 3",
    ],
    "running_apparel_top": [
        "Dri-FIT Rise 365", "Miler Tank", "Trail Tee", "Dri-FIT ADV Techknit", "Miler Singlet",
        "Pacer Half-Zip", "Element Hoodie", "Dri-FIT UV Miler", "Run Division Tee", "Fast Tank",
    ],
    "running_apparel_bottom": [
        "Challenger Shorts 7in", "Trail Shorts", "Epic Luxe Tights", "Stride Shorts", "Flex Stride 5in",
        "Fast Tights", "Phenom Pants", "Run Division Tights", "AeroSwift Shorts", "Trail Tights",
    ],
    "training_apparel": [
        "Flex Rep Shorts", "Dri-FIT Training Tee", "Pro 365 Tight", "Unlimited Shorts", "Form Pants",
        "Pro Dri-FIT Tank", "Totality Shorts", "ADV A.P.S. Top", "Form Hoodie", "Pro Combat Tee",
    ],
    "accessories": [
        "Spark Cushioned Socks", "Running Arm Sleeves", "Hydration Race Vest", "Featherlight Cap",
        "Lightweight Running Gloves", "Slim Waist Pack", "Cushioned Crew Socks", "Reflective Headband",
        "Trail Gaiters", "Soft Flask 500ml", "Dri-FIT Headband", "Calf Compression Sleeves",
        "Running Visor", "Trail Beanie", "Ankle Socks 3-Pack",
    ],
}

# Per-category attribute templates for ML matching.
SHOE_SURFACES = {
    "road_running_shoes": ["road", "track"],
    "trail_running_shoes": ["trail"],
    "training_shoes": ["treadmill"],
}
APPAREL_SURFACES = ["road", "trail", "treadmill", "track"]

ALL_GOALS = ["5k", "10k", "half_marathon", "marathon", "general_fitness"]
RACE_GOALS = ["5k", "10k", "half_marathon", "marathon"]
ALL_FITNESS = ["beginner", "intermediate", "advanced"]

CATEGORY_PRICE = {
    "road_running_shoes": (8995, 22995),
    "trail_running_shoes": (9995, 16995),
    "training_shoes": (7995, 14995),
    "running_apparel_top": (1995, 5495),
    "running_apparel_bottom": (2495, 5995),
    "training_apparel": (1795, 4995),
    "accessories": (795, 4995),
}

SUBCATEGORY = {
    "road_running_shoes": ["neutral_cushion", "stability", "race_day", "daily_trainer"],
    "trail_running_shoes": ["technical_trail", "door_to_trail", "ultra"],
    "training_shoes": ["cross_training", "lifting", "hiit"],
    "running_apparel_top": ["tank", "tee", "long_sleeve", "midlayer"],
    "running_apparel_bottom": ["shorts", "tights", "pants"],
    "training_apparel": ["shorts", "tee", "tights", "midlayer"],
    "accessories": ["socks", "headwear", "hydration", "sleeves"],
}

DESCRIPTIONS = {
    "road_running_shoes": "Responsive cushioning built for logging road miles day after day.",
    "trail_running_shoes": "Rugged grip and protection for technical, off-road terrain.",
    "training_shoes": "Stable, flat platform for lifting, HIIT and gym cross-training.",
    "running_apparel_top": "Sweat-wicking, breathable fabric that keeps you cool on the move.",
    "running_apparel_bottom": "Lightweight, flexible coverage with a secure, run-ready fit.",
    "training_apparel": "Durable, stretchy material that moves with you through every rep.",
    "accessories": "A small upgrade that makes a real difference on training day.",
}


def image_url(name: str) -> str:
    label = name.replace(" ", "+")
    return f"https://placehold.co/600x600/111111/FFFFFF?text=Nike+{label}"


def build_products():
    products = []
    name_to_id = {}
    pid = 1
    for category, names in CATALOG.items():
        for name in names:
            product_id = f"PROD_{pid:03d}"
            name_to_id[name] = product_id

            if category in SHOE_SURFACES:
                surfaces = list(SHOE_SURFACES[category])
            else:
                surfaces = list(APPAREL_SURFACES)

            if category == "road_running_shoes":
                goals = list(RACE_GOALS)
            elif category == "trail_running_shoes":
                goals = ["10k", "half_marathon", "marathon", "general_fitness"]
            elif category == "training_shoes":
                goals = ["general_fitness"]
            else:
                goals = list(ALL_GOALS)

            # Race-day shoes skew advanced; entry shoes skew beginner.
            if name in ("Vaporfly 3", "Alphafly 3", "Zoom Fly 5"):
                fitness = ["intermediate", "advanced"]
            elif name in ("Revolution 7", "Downshifter 13", "Winflo 11"):
                fitness = ["beginner", "intermediate"]
            else:
                fitness = list(ALL_FITNESS)

            price_lo, price_hi = CATEGORY_PRICE[category]
            price = int(round(random.randint(price_lo, price_hi) / 100.0)) * 100 - 5

            product = {
                "product_id": product_id,
                "name": f"Nike {name}",
                "category": category,
                "subcategory": random.choice(SUBCATEGORY[category]),
                "price_inr": price,
                "gender": random.choice(["unisex", "unisex", "men", "women"]),
                "suitable_surfaces": surfaces,
                "suitable_goals": goals,
                "fitness_level": fitness,
                "replaces_product_id": None,
                "image_url": image_url(name),
                "tags": [],
                "avg_rating": round(random.uniform(4.0, 4.9), 1),
                "is_new": random.random() < 0.3,
                "description": DESCRIPTIONS[category],
            }
            products.append(product)
            pid += 1

    # Wire the shoe-replacement successor relationship.
    peg41 = name_to_id["Pegasus 41"]
    peg40 = name_to_id["Pegasus 40"]
    for p in products:
        if p["product_id"] == peg41:
            p["replaces_product_id"] = peg40
            p["is_new"] = True
            p["tags"] = ["cushioned", "daily_trainer", "high_mileage", "road"]
            p["description"] = (
                "The everyday road runner's workhorse, now with a smoother, "
                "more responsive ride. Built for high-mileage training."
            )
    return products, name_to_id


# --------------------------------------------------------------------------
# Users + activity + interactions
# --------------------------------------------------------------------------

TODAY = date(2026, 6, 21)


def iso(d: date) -> str:
    return d.isoformat()


def spend_bucket(profile):
    if profile in ("A", "C"):
        return {"min": 12000, "max": 25000}, "high"
    if profile in ("D",):
        return {"min": 8000, "max": 15000}, "mid"
    return {"min": 4000, "max": 9000}, "low"


def build_users():
    users = []
    profiles = []
    # 10 users per profile A..E, interleaved across cities.
    order = []
    for p in ["A", "B", "C", "D", "E"]:
        for _ in range(10):
            order.append(p)

    used_names = set()
    for i, profile in enumerate(order):
        uid = f"USR_{i + 1:03d}"
        city, lat, lon = CITIES[i % len(CITIES)]

        # Unique-ish name.
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in used_names:
                used_names.add(name)
                break

        if profile == "E":
            since = TODAY - timedelta(days=random.randint(4, 26))
            tier = "new"
        else:
            since = TODAY - timedelta(days=random.randint(400, 1600))
            tier = random.choice(["gold", "gold", "platinum", "standard"])

        spend, _ = spend_bucket(profile)

        users.append({
            "user_id": uid,
            "name": name,
            "city": city,
            "latitude": lat,
            "longitude": lon,
            "nikeplus_since": iso(since),
            "shoe_size_us": random.choice([7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12]),
            "gender": random.choice(["male", "female"]),
            "age_group": random.choice(["18-24", "25-34", "25-34", "35-44", "45-54"]),
            "membership_tier": tier,
            "spend_range_inr": spend,
            "profile_type": PROFILE_TYPES[profile],
            "profile_label": PROFILE_LABELS[profile],
        })
        profiles.append(profile)
    return users, profiles


def build_activity(users, profiles):
    activity = []
    for user, profile in zip(users, profiles):
        if profile == "A":  # high mileage road
            total_km = random.randint(400, 600)
            shoe_km = random.randint(410, 540)  # > 400 -> replacement trigger
            nrc = {
                "total_km_logged": total_km,
                "runs_per_week_avg": round(random.uniform(3.8, 5.5), 1),
                "preferred_surface": "road",
                "preferred_time_of_day": random.choice(["morning", "evening"]),
                "avg_pace_min_per_km": round(random.uniform(4.6, 5.8), 1),
                "current_goal": random.choice(["half_marathon", "marathon"]),
                "current_shoe_km": shoe_km,
                "current_shoe_name": "Nike Pegasus 40",
                "streak_days": random.randint(20, 120),
                "last_run_date": iso(TODAY - timedelta(days=random.randint(0, 2))),
            }
            ntc = {
                "workouts_per_week_avg": round(random.uniform(1.0, 2.5), 1),
                "preferred_workout_types": ["strength", "mobility"],
                "total_workouts_completed": random.randint(40, 120),
                "fitness_level": random.choice(["intermediate", "advanced"]),
            }
        elif profile == "B":  # casual jogger
            nrc = {
                "total_km_logged": random.randint(20, 99),
                "runs_per_week_avg": round(random.uniform(1.0, 2.5), 1),
                "preferred_surface": "treadmill",
                "preferred_time_of_day": random.choice(["morning", "evening", "night"]),
                "avg_pace_min_per_km": round(random.uniform(6.5, 8.0), 1),
                "current_goal": random.choice(["general_fitness", "5k"]),
                "current_shoe_km": random.randint(20, 180),
                "current_shoe_name": "Nike Revolution 7",
                "streak_days": random.randint(0, 14),
                "last_run_date": iso(TODAY - timedelta(days=random.randint(1, 9))),
            }
            ntc = {
                "workouts_per_week_avg": round(random.uniform(0.5, 2.0), 1),
                "preferred_workout_types": ["cardio", "yoga"],
                "total_workouts_completed": random.randint(5, 40),
                "fitness_level": "beginner",
            }
        elif profile == "C":  # HIIT + strength, minimal running
            nrc = {
                "total_km_logged": random.randint(0, 30),
                "runs_per_week_avg": round(random.uniform(0.0, 1.0), 1),
                "preferred_surface": "treadmill",
                "preferred_time_of_day": random.choice(["morning", "evening"]),
                "avg_pace_min_per_km": round(random.uniform(6.0, 7.5), 1),
                "current_goal": "general_fitness",
                "current_shoe_km": random.randint(0, 60),
                "current_shoe_name": "Nike Metcon 8",
                "streak_days": random.randint(0, 30),
                "last_run_date": iso(TODAY - timedelta(days=random.randint(3, 20))),
            }
            ntc = {
                "workouts_per_week_avg": round(random.uniform(3.0, 5.0), 1),
                "preferred_workout_types": ["hiit", "strength"],
                "total_workouts_completed": random.randint(80, 220),
                "fitness_level": random.choice(["intermediate", "advanced"]),
            }
        elif profile == "D":  # multi-sport
            nrc = {
                "total_km_logged": random.randint(120, 320),
                "runs_per_week_avg": round(random.uniform(2.0, 3.5), 1),
                "preferred_surface": random.choice(["road", "trail"]),
                "preferred_time_of_day": random.choice(["morning", "evening"]),
                "avg_pace_min_per_km": round(random.uniform(5.4, 6.8), 1),
                "current_goal": random.choice(["10k", "half_marathon", "general_fitness"]),
                "current_shoe_km": random.randint(80, 300),
                "current_shoe_name": "Nike Pegasus Trail 5",
                "streak_days": random.randint(5, 60),
                "last_run_date": iso(TODAY - timedelta(days=random.randint(0, 5))),
            }
            ntc = {
                "workouts_per_week_avg": round(random.uniform(2.0, 3.5), 1),
                "preferred_workout_types": ["strength", "hiit", "mobility"],
                "total_workouts_completed": random.randint(50, 150),
                "fitness_level": "intermediate",
            }
        else:  # E - new member, cold start
            nrc = {
                "total_km_logged": random.randint(0, 18),
                "runs_per_week_avg": round(random.uniform(0.0, 1.5), 1),
                "preferred_surface": random.choice(["road", "treadmill", "trail"]),
                "preferred_time_of_day": random.choice(["morning", "evening"]),
                "avg_pace_min_per_km": round(random.uniform(6.0, 8.0), 1),
                "current_goal": random.choice(["general_fitness", "5k", "10k"]),
                "current_shoe_km": random.randint(0, 25),
                "current_shoe_name": None,
                "streak_days": random.randint(0, 6),
                "last_run_date": iso(TODAY - timedelta(days=random.randint(0, 6))),
            }
            ntc = {
                "workouts_per_week_avg": round(random.uniform(0.0, 1.5), 1),
                "preferred_workout_types": random.choice([["strength"], ["cardio"], ["yoga"]]),
                "total_workouts_completed": random.randint(0, 6),
                "fitness_level": "beginner",
            }

        activity.append({"user_id": user["user_id"], "nrc": nrc, "ntc": ntc})
    return activity


def build_interactions(users, profiles, name_to_id, products):
    by_cat = {}
    for p in products:
        by_cat.setdefault(p["category"], []).append(p)

    interactions = []
    for user, profile in zip(users, profiles):
        uid = user["user_id"]
        purchases = []
        browses = []
        searches = []
        prefs = []

        def add_purchase(product, days_ago, full_price=True):
            purchases.append({
                "product_id": product["product_id"],
                "product_name": product["name"],
                "category": product["category"],
                "price_inr": product["price_inr"],
                "purchase_date": iso(TODAY - timedelta(days=days_ago)),
                "is_full_price": full_price,
            })

        def add_browse(product, days_ago, cart=False, revisit=False):
            browses.append({
                "product_id": product["product_id"],
                "category": product["category"],
                "time_spent_seconds": random.randint(20, 220),
                "added_to_cart": cart,
                "revisited": revisit,
                "last_viewed": iso(TODAY - timedelta(days=days_ago)),
            })

        if profile == "A":
            peg40 = next(p for p in products if p["product_id"] == name_to_id["Pegasus 40"])
            add_purchase(peg40, random.randint(180, 320))
            top = random.choice(by_cat["running_apparel_top"])
            add_purchase(top, random.randint(30, 150))
            add_browse(random.choice(by_cat["road_running_shoes"]), random.randint(2, 20), revisit=True)
            add_browse(random.choice(by_cat["accessories"]), random.randint(1, 15), cart=True)
            searches = ["pegasus 41", "half marathon shoes", "running socks", "anti chafe shorts"]
            prefs = ["road_running_shoes", "running_apparel_top", "accessories"]
        elif profile == "B":
            shoe = random.choice(by_cat["road_running_shoes"][-5:])
            add_purchase(shoe, random.randint(120, 300))
            add_browse(random.choice(by_cat["running_apparel_bottom"]), random.randint(3, 25))
            add_browse(random.choice(by_cat["running_apparel_top"]), random.randint(1, 12), revisit=True)
            searches = ["beginner running shoes", "treadmill shoes", "gym tee"]
            prefs = ["road_running_shoes", "running_apparel_top"]
        elif profile == "C":
            metcon = random.choice(by_cat["training_shoes"][:4])
            add_purchase(metcon, random.randint(60, 240))
            add_purchase(random.choice(by_cat["training_apparel"]), random.randint(20, 120))
            add_browse(random.choice(by_cat["training_shoes"]), random.randint(1, 15), revisit=True)
            add_browse(random.choice(by_cat["accessories"]), random.randint(2, 18))
            searches = ["metcon 9", "lifting shoes", "training shorts", "wrist wraps"]
            prefs = ["training_shoes", "training_apparel", "accessories"]
        elif profile == "D":
            add_purchase(random.choice(by_cat["trail_running_shoes"]), random.randint(90, 260))
            add_purchase(random.choice(by_cat["training_apparel"]), random.randint(25, 130))
            add_browse(random.choice(by_cat["road_running_shoes"]), random.randint(2, 22), revisit=True)
            add_browse(random.choice(by_cat["running_apparel_top"]), random.randint(1, 14), cart=True)
            searches = ["trail shoes", "10k training", "compression sleeves"]
            prefs = ["trail_running_shoes", "training_apparel", "road_running_shoes"]
        else:  # E - cold start: fewer than 3 interactions total
            if random.random() < 0.5:
                add_browse(random.choice(by_cat["road_running_shoes"]), random.randint(0, 5))
            searches = random.choice([["running shoes"], ["gym wear"], []])
            prefs = [random.choice(list(CATALOG.keys()))]

        interactions.append({
            "user_id": uid,
            "purchase_history": purchases,
            "browse_history": browses,
            "search_queries": searches,
            "preferred_categories": prefs,
        })
    return interactions


def main():
    products, name_to_id = build_products()
    users, profiles = build_users()
    activity = build_activity(users, profiles)
    interactions = build_interactions(users, profiles, name_to_id, products)

    files = {
        "products.json": products,
        "users.json": users,
        "activity.json": activity,
        "interactions.json": interactions,
    }
    for fname, payload in files.items():
        path = os.path.join(DATA_DIR, fname)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        print(f"wrote {fname:20s} {len(payload):>4d} records")

    # Quick sanity summary.
    cold = sum(
        1 for it in interactions
        if (len(it["purchase_history"]) + len(it["browse_history"])) < 3
    )
    print(f"\ncold-start users (<3 interactions): {cold}")
    print(f"products: {len(products)} | successor wired: "
          f"{any(p['replaces_product_id'] for p in products)}")


if __name__ == "__main__":
    main()
