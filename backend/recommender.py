"""
Hybrid recommendation engine (PRD section 9).

Layer 1  User feature vector   - merge NRC + NTC + Nike.com signals
Layer 2  Content-based filter  - cosine similarity user<->product, keep ~15
Layer 3  Collaborative filter  - NearestNeighbors over the interaction matrix
                                  rank the shortlist by similar-user patterns

Final score = 0.4 * content + 0.6 * collaborative.
Cold start (< 3 interactions): content-only, flagged for the frontend.
Shoe replacement: if current_shoe_km > 400 and the user owns a shoe with a
catalog successor, that successor is force-surfaced into the top results.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors

from explainability import generate_reason

# --- Shared feature space (user vector and product vector share these dims) --
SURFACES = ["road", "trail", "treadmill", "track"]
GOALS = ["5k", "10k", "half_marathon", "marathon", "general_fitness"]
FITNESS = ["beginner", "intermediate", "advanced"]
CATEGORIES = [
    "road_running_shoes", "trail_running_shoes", "training_shoes",
    "running_apparel_top", "running_apparel_bottom", "training_apparel",
    "accessories",
]
FEATURE_DIM = len(SURFACES) + len(GOALS) + len(FITNESS) + len(CATEGORIES)

COLD_START_THRESHOLD = 3
SHOE_REPLACEMENT_KM = 400
CONTENT_WEIGHT = 0.4
COLLAB_WEIGHT = 0.6

# Interaction weights for the collaborative matrix.
W_PURCHASED = 1.0
W_CART = 0.5
W_REVISITED = 0.3
W_VIEWED = 0.1


def _onehot(value, vocabulary):
    vec = np.zeros(len(vocabulary), dtype=float)
    if value in vocabulary:
        vec[vocabulary.index(value)] = 1.0
    return vec


def _multihot(values, vocabulary):
    vec = np.zeros(len(vocabulary), dtype=float)
    for v in values or []:
        if v in vocabulary:
            vec[vocabulary.index(v)] = 1.0
    return vec


class Recommender:
    """Built once at startup from the in-memory DataStore."""

    def __init__(self, store):
        self.store = store
        self.products = store.products
        self.product_ids = [p["product_id"] for p in self.products]
        self._product_index = {pid: i for i, pid in enumerate(self.product_ids)}

        self.product_matrix = self._build_product_matrix()
        self.interaction_matrix, self.user_order = self._build_interaction_matrix()
        self._user_index = {uid: i for i, uid in enumerate(self.user_order)}

        # Fit the collaborative model on all users' interaction rows.
        n_neighbors = min(6, len(self.user_order))
        self.knn = NearestNeighbors(n_neighbors=n_neighbors, metric="cosine")
        self.knn.fit(self.interaction_matrix)

    # -- Layer 1: feature vectors -------------------------------------------

    def build_user_vector(self, user_id):
        activity = self.store.get_activity(user_id)
        inter = self.store.get_interactions(user_id)
        nrc = activity["nrc"]
        ntc = activity["ntc"]

        surface = _onehot(nrc.get("preferred_surface"), SURFACES)
        goal = _onehot(nrc.get("current_goal"), GOALS)
        fitness = _onehot(ntc.get("fitness_level"), FITNESS)

        prefs = (inter or {}).get("preferred_categories", [])
        category = _multihot(prefs, CATEGORIES)
        # NTC-active users get a training-category nudge even without explicit prefs.
        if ntc.get("workouts_per_week_avg", 0) >= 2.5:
            category[CATEGORIES.index("training_shoes")] = max(
                category[CATEGORIES.index("training_shoes")], 0.6)
            category[CATEGORIES.index("training_apparel")] = max(
                category[CATEGORIES.index("training_apparel")], 0.6)

        return np.concatenate([surface, goal, fitness, category]).reshape(1, -1)

    def _product_vector(self, product):
        surface = _multihot(product.get("suitable_surfaces", []), SURFACES)
        goal = _multihot(product.get("suitable_goals", []), GOALS)
        fitness = _multihot(product.get("fitness_level", []), FITNESS)
        category = _onehot(product.get("category"), CATEGORIES)
        return np.concatenate([surface, goal, fitness, category])

    def _build_product_matrix(self):
        return np.vstack([self._product_vector(p) for p in self.products])

    # -- Layer 3 prep: interaction matrix -----------------------------------

    def _build_interaction_matrix(self):
        user_order = [u["user_id"] for u in self.store.users]
        matrix = np.zeros((len(user_order), len(self.product_ids)), dtype=float)
        for row, uid in enumerate(user_order):
            inter = self.store.get_interactions(uid) or {}
            for pur in inter.get("purchase_history", []):
                col = self._product_index.get(pur["product_id"])
                if col is not None:
                    matrix[row, col] = max(matrix[row, col], W_PURCHASED)
            for br in inter.get("browse_history", []):
                col = self._product_index.get(br["product_id"])
                if col is None:
                    continue
                if br.get("added_to_cart"):
                    weight = W_CART
                elif br.get("revisited"):
                    weight = W_REVISITED
                else:
                    weight = W_VIEWED
                matrix[row, col] = max(matrix[row, col], weight)
        return matrix, user_order

    # -- shoe-replacement trigger -------------------------------------------

    def _replacement_successor(self, user_id):
        """Return (successor_product, owned_product) if a replacement is due."""
        activity = self.store.get_activity(user_id)
        shoe_km = activity["nrc"].get("current_shoe_km", 0)
        if shoe_km <= SHOE_REPLACEMENT_KM:
            return None, None

        inter = self.store.get_interactions(user_id) or {}
        owned_ids = {p["product_id"] for p in inter.get("purchase_history", [])}
        for product in self.products:
            pred = product.get("replaces_product_id")
            if pred and pred in owned_ids:
                owned = self.store.get_product(pred)
                return product, owned
        return None, None

    # -- main entry point ----------------------------------------------------

    def recommend(self, user_id, limit=8):
        user = self.store.get_user(user_id)
        if user is None:
            raise KeyError(user_id)

        cold_start = self.store.interaction_count(user_id) < COLD_START_THRESHOLD

        # Layer 2 - content similarity for every product.
        user_vec = self.build_user_vector(user_id)
        content_sims = cosine_similarity(user_vec, self.product_matrix)[0]

        # Don't recommend items the user already owns (a successor shoe is a
        # new product, so it is unaffected by this).
        inter = self.store.get_interactions(user_id) or {}
        owned_ids = {p["product_id"] for p in inter.get("purchase_history", [])}

        # Shortlist: ~15 by content similarity, excluding owned products, but
        # capped per category so a single category (e.g. road shoes) can't
        # crowd out everything else. This keeps the feed relevant *and* varied.
        ranked_by_content = [i for i in np.argsort(content_sims)[::-1]
                             if self.product_ids[i] not in owned_ids]
        shortlist_idx = self._select_with_cap(
            ranked_by_content, size=15, cap=5)

        successor, owned = self._replacement_successor(user_id)
        if successor is not None:
            succ_idx = self._product_index[successor["product_id"]]
            if succ_idx not in shortlist_idx:
                shortlist_idx.append(succ_idx)

        # Layer 3 - collaborative scoring within the shortlist.
        collab_scores = {i: 0.0 for i in shortlist_idx}
        method = "content"
        if not cold_start:
            method = "collaborative"
            collab_scores = self._collaborative_scores(user_id, shortlist_idx)

        # Normalise both score sources to 0..1 for a fair blend.
        content_norm = self._normalise({i: content_sims[i] for i in shortlist_idx})
        collab_norm = self._normalise(collab_scores)

        ranked = []
        for i in shortlist_idx:
            if cold_start:
                final = content_norm[i]
            else:
                final = CONTENT_WEIGHT * content_norm[i] + COLLAB_WEIGHT * collab_norm[i]
            ranked.append((i, final))
        ranked.sort(key=lambda x: x[1], reverse=True)

        # Force the successor shoe into the top 3 if a replacement is due.
        protected = set()
        if successor is not None:
            succ_idx = self._product_index[successor["product_id"]]
            ranked = [(i, s) for (i, s) in ranked if i != succ_idx]
            ranked.insert(0, (succ_idx, 1.0))
            protected.add(succ_idx)

        # Final selection: cap each category so the grid spans shoes, apparel
        # and accessories instead of returning eight near-identical shoes.
        ranked_order = [i for i, _ in ranked]
        chosen = self._select_with_cap(
            ranked_order, size=limit, cap=3, protected=protected)
        score_by_idx = {i: s for i, s in ranked}

        results = []
        for idx in chosen:
            score = score_by_idx[idx]
            product = self.products[idx]
            is_replacement = (
                successor is not None and product["product_id"] == successor["product_id"]
            )
            reason, reason_type = generate_reason(
                user=user,
                activity=self.store.get_activity(user_id),
                product=product,
                method=method,
                cold_start=cold_start,
                is_replacement=is_replacement,
                owned_product=owned,
            )
            results.append({
                "product_id": product["product_id"],
                "name": product["name"],
                "category": product["category"],
                "price_inr": product["price_inr"],
                "image_url": product["image_url"],
                "avg_rating": product["avg_rating"],
                "reason": reason,
                "reason_type": reason_type,
                "similarity_score": round(float(content_sims[idx]), 3),
                "final_score": round(float(score), 3),
                "is_new": product.get("is_new", False),
            })
        return results, cold_start

    # -- helpers -------------------------------------------------------------

    def _collaborative_scores(self, user_id, shortlist_idx):
        row = self.interaction_matrix[self._user_index[user_id]].reshape(1, -1)
        n_neighbors = min(6, len(self.user_order))
        distances, indices = self.knn.kneighbors(row, n_neighbors=n_neighbors)

        scores = {i: 0.0 for i in shortlist_idx}
        for dist, neigh in zip(distances[0], indices[0]):
            if self.user_order[neigh] == user_id:
                continue  # skip self
            similarity = 1.0 - dist
            for i in shortlist_idx:
                scores[i] += similarity * self.interaction_matrix[neigh, i]
        return scores

    def _select_with_cap(self, ordered_idx, size, cap, protected=frozenset()):
        """Pick `size` indices from a ranked list, allowing at most `cap` per
        category. Protected indices ignore the cap. A second pass fills any
        remaining slots if the caps left us short.
        """
        selected, counts = [], {}
        for i in ordered_idx:
            if len(selected) >= size:
                break
            cat = self.products[i]["category"]
            if i in protected or counts.get(cat, 0) < cap:
                selected.append(i)
                counts[cat] = counts.get(cat, 0) + 1
        if len(selected) < size:
            chosen = set(selected)
            for i in ordered_idx:
                if len(selected) >= size:
                    break
                if i not in chosen:
                    selected.append(i)
        return selected

    @staticmethod
    def _normalise(score_map):
        if not score_map:
            return {}
        values = list(score_map.values())
        lo, hi = min(values), max(values)
        if hi - lo < 1e-9:
            return {k: 0.0 for k in score_map}
        return {k: (v - lo) / (hi - lo) for k, v in score_map.items()}


_recommender = None


def get_recommender(store):
    global _recommender
    if _recommender is None:
        _recommender = Recommender(store)
    return _recommender
