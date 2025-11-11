/**
 * Shared API client (callable + helpers)
 * - callable: api(path, options?) -> fetch JSON
 * - methods:  api.getNotes(...), api.attachPart(...), api.start(...), etc.
 * - query-fn wrappers for TanStack React Query: api.getSummaryQF, api.getTimelineQF, api.getMechanicsQF
 */

const API_URL: string = import.meta.env.VITE_API_URL as string;

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function baseFetch(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("API error:", path, res.status, text);
    throw new Error(`Fetch ${path} failed: ${res.status} ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// ---------- base verbs ----------
async function get(path: string) {
  return baseFetch(path);
}
async function post(path: string, body?: unknown) {
  return baseFetch(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// ---------- domain helpers ----------
// Notes
async function getNotes(woId: number) {
  return get(`/work-orders/${woId}/notes`);
}
async function addNote(woId: number, author: string, text: string) {
  return post(`/work-orders/${woId}/notes`, { author, text });
}

// Parts
async function searchParts(q: string) {
  const qs = encodeURIComponent(q);
  return get(`/parts/search?q=${qs}`);
}
async function attachPart(woId: number, partId: number, qty: number) {
  return post(`/work-orders/${woId}/parts`, { part_id: partId, qty });
}

// Summary / timeline
async function getSummary(woId: number) {
  return get(`/work-orders/${woId}/summary`);
}
async function getTimeline(woId: number) {
  return get(`/work-orders/${woId}/timeline`);
}

// Assignment & lifecycle
async function assign(woId: number, mechanic_id: number) {
  return post(`/work-orders/${woId}/assign`, { mechanic_id });
}
async function start(woId: number, mechanic_id: number, odometer?: number) {
  return post(`/work-orders/${woId}/start`, { mechanic_id, odometer });
}
async function pause(woId: number, mechanic_id: number, reason?: string) {
  return post(`/work-orders/${woId}/pause`, { mechanic_id, reason });
}
async function resume(woId: number, mechanic_id: number) {
  return post(`/work-orders/${woId}/resume`, { mechanic_id });
}
async function complete(woId: number, mechanic_id: number) {
  return post(`/work-orders/${woId}/complete`, { mechanic_id });
}

// Mechanics
async function getMechanics() {
  return get(`/mechanics`);
}

// Friendly WO number
function woNumber(id: number) {
  return `WO-${String(id).padStart(5, "0")}`;
}

// ---------- React Query queryFn wrappers ----------
// They accept TanStack's context { queryKey, signal, ... }.
type QF = (ctx: any) => Promise<any>;

const getSummaryQF: QF = ({ queryKey }: any) => {
  const woId = Number(queryKey?.[1]);
  return getSummary(woId);
};

const getTimelineQF: QF = ({ queryKey }: any) => {
  const woId = Number(queryKey?.[1]);
  return getTimeline(woId);
};

const getMechanicsQF: QF = () => getMechanics();

// ---------- build callable api object ----------
type ApiCallable = (path: string, options?: RequestInit) => Promise<any>;
type ApiType = ApiCallable & {
  // verbs
  get: typeof get;
  post: typeof post;
  // notes
  getNotes: typeof getNotes;
  addNote: typeof addNote;
  // parts
  searchParts: typeof searchParts;
  attachPart: typeof attachPart;
  // summary/timeline
  getSummary: typeof getSummary;
  getTimeline: typeof getTimeline;
  // lifecycle
  assign: typeof assign;
  start: typeof start;
  pause: typeof pause;
  resume: typeof resume;
  complete: typeof complete;
  // mechanics
  getMechanics: typeof getMechanics;
  // query-fn wrappers
  getSummaryQF: typeof getSummaryQF;
  getTimelineQF: typeof getTimelineQF;
  getMechanicsQF: typeof getMechanicsQF;
  // utils
  woNumber: typeof woNumber;
};

const api = Object.assign(baseFetch as ApiCallable, {
  get,
  post,
  // notes
  getNotes,
  addNote,
  // parts
  searchParts,
  attachPart,
  // summary/timeline
  getSummary,
  getTimeline,
  // lifecycle
  assign,
  start,
  pause,
  resume,
  complete,
  // mechanics
  getMechanics,
  // query-fn wrappers
  getSummaryQF,
  getTimelineQF,
  getMechanicsQF,
  // utils
  woNumber,
}) as ApiType;

// Export as both default and named, and export woNumber named as well
export { api, woNumber, getSummaryQF, getTimelineQF, getMechanicsQF };
export default api;
