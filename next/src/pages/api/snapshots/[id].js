import { Client } from "@elastic/elasticsearch";

const es = new Client({
  node: process.env.ELASTICSEARCH_HOST || "http://elasticsearch:9200",
});

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const result = await es.get({ index: "snapshots", id });
    const snapshot = { id: result._id, ...result._source };

    // Get prev and next snapshots
    const [prevResult, nextResult] = await Promise.all([
      es.search({
        index: "snapshots",
        body: {
          query: { range: { timestamp: { lt: snapshot.timestamp } } },
          sort: [{ timestamp: { order: "desc" } }],
          size: 1,
          _source: false,
        },
      }),
      es.search({
        index: "snapshots",
        body: {
          query: { range: { timestamp: { gt: snapshot.timestamp } } },
          sort: [{ timestamp: { order: "asc" } }],
          size: 1,
          _source: false,
        },
      }),
    ]);

    snapshot.prev = prevResult.hits.hits[0]?._id || null;
    snapshot.next = nextResult.hits.hits[0]?._id || null;

    res.json(snapshot);
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return res.status(404).json({ error: "Snapshot not found" });
    }
    console.error("ES error:", error.message);
    res.status(500).json({ error: "Failed to fetch snapshot" });
  }
}
