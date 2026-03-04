export async function fetchSnapshots({ page = 1, limit = 20, from, to } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const res = await fetch(`/api/snapshots?${params}`);
  if (!res.ok) throw new Error("Failed to fetch snapshots");
  return res.json();
}

export async function fetchSnapshot(id) {
  const res = await fetch(`/api/snapshots/${id}`);
  if (!res.ok) throw new Error("Failed to fetch snapshot");
  return res.json();
}

export async function searchSnapshots(query, page = 1) {
  const params = new URLSearchParams({ q: query, page });
  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function formatDateShort(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
