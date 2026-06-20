// Central API client. The base URL is injected at build time by Vite.
// Local dev defaults to the FastAPI server on port 8001; production reads
// VITE_API_BASE_URL (set in Vercel to the Render backend URL).
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8001";

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${path}`);
  }
  return res.json();
}

export const nikeApi = {
  baseUrl: BASE_URL,
  health: () => get("/api/health"),
  listUsers: () => get("/api/users"),
  getUser: (userId) => get(`/api/user/${userId}`),
  recommend: (userId, { personalised = true, limit = 8 } = {}) =>
    get(
      `/api/recommend/${userId}?personalised=${personalised}&limit=${limit}`
    ),
  listProducts: () => get("/api/products"),
};
