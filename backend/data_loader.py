"""
Loads the dummy JSON dataset into memory once at startup and exposes simple
lookup helpers. No database needed for a 50-user demo (see PRD section 7).
"""

import json
import os
from functools import lru_cache

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


def _load(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


class DataStore:
    """In-memory store for all dummy data, built once at app startup."""

    def __init__(self):
        self.users = _load("users.json")
        self.products = _load("products.json")
        self.activity = _load("activity.json")
        self.interactions = _load("interactions.json")

        # Index by id for O(1) lookups.
        self.users_by_id = {u["user_id"]: u for u in self.users}
        self.products_by_id = {p["product_id"]: p for p in self.products}
        self.activity_by_id = {a["user_id"]: a for a in self.activity}
        self.interactions_by_id = {i["user_id"]: i for i in self.interactions}

    # -- user-facing lookups -------------------------------------------------

    def get_user(self, user_id):
        return self.users_by_id.get(user_id)

    def get_activity(self, user_id):
        return self.activity_by_id.get(user_id)

    def get_interactions(self, user_id):
        return self.interactions_by_id.get(user_id)

    def get_product(self, product_id):
        return self.products_by_id.get(product_id)

    def interaction_count(self, user_id):
        """Total purchase + browse events — drives cold-start detection."""
        inter = self.get_interactions(user_id)
        if not inter:
            return 0
        return len(inter.get("purchase_history", [])) + len(inter.get("browse_history", []))


@lru_cache(maxsize=1)
def get_store() -> DataStore:
    """Singleton accessor so the dataset is parsed only once."""
    return DataStore()
