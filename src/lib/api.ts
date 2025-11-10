// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL;
console.log("Using API:", API_URL); // 👈 add this line temporarily to confirm

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Fetch failed:", path, res.status, text);
    throw new Error(`Fetch ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}
