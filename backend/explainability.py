"""
Explainability engine (PRD section 9).

Turns a (user, product, method) triple into a human-readable reason string
that references the user's real data — never generic filler. Every recommended
product gets exactly one reason and one reason_type.
"""


def _goal_phrase(goal):
    return (goal or "general_fitness").replace("_", " ")


def _surface_phrase(surface):
    return surface or "everyday"


def generate_reason(user, activity, product, method, cold_start,
                    is_replacement, owned_product):
    """Return (reason_string, reason_type)."""
    nrc = activity["nrc"]
    ntc = activity["ntc"]
    surface = _surface_phrase(nrc.get("preferred_surface"))
    goal = _goal_phrase(nrc.get("current_goal"))
    fitness = ntc.get("fitness_level", "intermediate")

    # 1. Shoe replacement always wins — it's the most actionable signal.
    if is_replacement:
        shoe_km = nrc.get("current_shoe_km")
        owned_name = (owned_product or {}).get("name") or nrc.get("current_shoe_name") or "current shoes"
        return (
            f"Your {owned_name} has {shoe_km}km on it — most runners consider a "
            f"replacement around 500km. This is the direct successor.",
            "shoe_replacement",
        )

    # 2. Cold-start members have stated preferences but little behaviour.
    if cold_start:
        return (
            f"Based on your stated {surface} training preference as a new member",
            "cold_start",
        )

    # 3. Collaborative — similar members drove this into your feed.
    if method == "collaborative":
        return (
            f"Popular with {fitness} members training for a {goal} like you",
            "collaborative",
        )

    # 4. Content — direct attribute match.
    return (
        f"Matched to your {surface} running and {goal} goal",
        "content",
    )


def data_signals_used(user, activity):
    """Plain-language list of the signals feeding this user's recs.

    Powers the 'Your data used' section of the explainability modal.
    """
    nrc = activity["nrc"]
    ntc = activity["ntc"]
    signals = [
        f"{nrc.get('total_km_logged', 0)}km logged in Nike Run Club this year",
        f"Preferred surface: {nrc.get('preferred_surface', 'n/a')}",
        f"Current goal: {_goal_phrase(nrc.get('current_goal'))}",
        f"Fitness level: {ntc.get('fitness_level', 'n/a')} (Nike Training Club)",
    ]
    shoe_km = nrc.get("current_shoe_km")
    shoe_name = nrc.get("current_shoe_name")
    if shoe_name and shoe_km:
        signals.append(f"{shoe_km}km on your {shoe_name}")
    return signals
