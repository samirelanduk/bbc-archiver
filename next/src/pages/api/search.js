import { searchIndex } from "@/lib/elasticsearch";

export default async function handler(req, res) {
  const { q, page, limit } = req.query;
  if (!q) {
    return res.json({ results: [], total: 0, page: 1, totalPages: 0 });
  }
  try {
    const data = await searchIndex(q, page, limit);
    res.json(data);
  } catch (error) {
    console.error("ES error:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
}
