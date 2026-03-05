import { getSnapshots } from "@/lib/elasticsearch";

export default async function handler(req, res) {
  try {
    const data = await getSnapshots(req.query);
    res.json(data);
  } catch (error) {
    console.error("ES error:", error.message);
    res.status(500).json({ error: "Failed to fetch snapshots" });
  }
}
