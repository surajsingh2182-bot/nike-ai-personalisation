# Nike AI Personalization Engine

A working prototype of a personalisation engine that bridges **Nike Run Club /
Nike Training Club** activity data with the **Nike.com** catalog — built to the
[product requirements doc](../Nike_AI_Personalization_PRD.md).

A member who has run 482 km in a Pegasus 40 and is training for a half marathon
sees a homepage built around *them* — including a timely nudge to replace their
shoes — while a HIIT athlete sees training shoes and cross-training gear. Every
recommendation explains itself in plain language.

> ⚠️ Prototype with **dummy data only**. Not affiliated with Nike, Inc.

---

## What's inside

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS v4 | Black / white / Nike-orange, system fonts |
| Backend | FastAPI (Python) | 5 REST endpoints |
| ML | scikit-learn (cosine similarity + NearestNeighbors) | Hybrid: content-based → collaborative |
| Weather | Open-Meteo | No API key; contextualises copy |
| Data | 4 JSON files loaded in memory | 50 users · 80 products · activity · interactions |

### How the recommender works
1. **User feature vector** — merges NRC + NTC + Nike.com signals (surface, goal, fitness, category prefs).
2. **Content-based filter** — cosine similarity of user vs. every product narrows the catalog to a category-balanced shortlist of ~15.
3. **Collaborative filter** — `NearestNeighbors` finds similar members and re-ranks the shortlist by their purchase patterns. Final score = 0.4 × content + 0.6 × collaborative.
4. **Cold start** — members with < 3 interactions skip the collaborative layer and get content-only recs, labelled "based on your stated preferences".
5. **Shoe-replacement trigger** — if the current shoe has > 400 km and the member owns a shoe with a catalog successor, that successor is force-surfaced into the top results.

---

## Run it locally

Requires Python 3.11+ and Node 18+.

### 1. Backend (terminal 1)
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```
The API is now at `http://127.0.0.1:8001` (e.g. `/api/health`, `/api/recommend/USR_001`).

> Port **8001** (not 8000) is the local default here — 8000 was occupied during
> development. Change it freely; just keep the frontend's `VITE_API_BASE_URL` in
> sync. Production (Render) uses its own assigned `$PORT`.

### 2. Frontend (terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open the printed URL (typically `http://localhost:5173`). The frontend defaults
to the backend at `http://127.0.0.1:8001`; override with a `frontend/.env.local`:
```
VITE_API_BASE_URL=http://127.0.0.1:8001
```

### Regenerating the dummy data
```bash
python scripts/generate_data.py     # deterministic; rewrites backend/data/*.json
python scripts/smoke_test.py        # checks the engine against the PRD criteria
```

---

## Deploy to a public URL

Two free services, two URLs. Deploy the **backend first** so you have its URL
for the frontend's environment variable.

### Step 1 — Push to GitHub
Create a new GitHub repo, then from this folder:
```bash
git init
git add .
git commit -m "Nike AI Personalization Engine"
git branch -M main
git remote add origin https://github.com/<you>/nike-ai-personalisation.git
git push -u origin main
```

### Step 2 — Backend on Render (free)
1. Sign in at [render.com](https://render.com) with GitHub.
2. **New + → Web Service** → pick this repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
4. Create the service. You'll get a URL like `https://nike-ai-backend.onrender.com`.
   Confirm `https://<that-url>/api/health` returns `{"status":"ok"}`.

> The repo also includes `render.yaml`, so you can instead use **New + →
> Blueprint** to configure all of the above automatically.
>
> Free tier sleeps after ~15 min idle; the first request then takes ~30 s. The
> frontend shows a "Warming up" screen for exactly this case.

### Step 3 — Frontend on Vercel (free)
1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project** → pick this repo.
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` · **Output Directory:** `dist`
4. **Environment Variables** → add:
   - `VITE_API_BASE_URL` = your Render URL (e.g. `https://nike-ai-backend.onrender.com`)
5. Deploy. You'll get a public URL like `https://nike-ai-personalisation.vercel.app`.

**That Vercel URL is the demo to share.** No login required.

> If you deploy the frontend before setting `VITE_API_BASE_URL`, set it and
> redeploy — Vite bakes env vars in at build time.

---

## Project structure
```
nike-ai-personalisation/
├── backend/            FastAPI app + ML engine + dummy data
│   ├── main.py             endpoints
│   ├── recommender.py      hybrid content + collaborative engine
│   ├── explainability.py   plain-language reason strings
│   ├── weather.py          Open-Meteo integration
│   ├── data_loader.py      in-memory JSON store
│   ├── requirements.txt    pinned for Render (Python 3.11)
│   └── data/*.json         50 users · 80 products · activity · interactions
├── frontend/           React + Vite + Tailwind UI
│   └── src/
│       ├── components/     briefing, grid, cards, drawer, modal, toggle
│       ├── hooks/ api/ utils
│       └── App.jsx
├── scripts/            generate_data.py · smoke_test.py
├── render.yaml         Render blueprint for the backend
└── README.md
```
