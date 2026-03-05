import { getSnapshot } from "@/lib/elasticsearch";

export default async function handler(req, res) {
  try {
    const snapshot = await getSnapshot(req.query.id);
    res.json(snapshot);
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return res.status(404).json({ error: "Snapshot not found" });
    }
    console.error("ES error:", error.message);
    res.status(500).json({ error: "Failed to fetch snapshot" });
  }
}
