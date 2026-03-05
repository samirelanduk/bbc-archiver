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
