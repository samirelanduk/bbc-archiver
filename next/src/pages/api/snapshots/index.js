import { Client } from "@elastic/elasticsearch";

const es = new Client({
  node: process.env.ELASTICSEARCH_HOST || "http://elasticsearch:9200",
});

export default async function handler(req, res) {
  const { page = 1, limit = 20, from, to } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const query = { bool: { must: [{ match_all: {} }] } };
  if (from || to) {
    const range = { timestamp: {} };
    if (from) range.timestamp.gte = from;
    if (to) range.timestamp.lte = to + "T23:59:59";
    query.bool.filter = [{ range }];
  }

  try {
    const result = await es.search({
      index: "snapshots",
      body: {
        query,
        sort: [{ timestamp: { order: "desc" } }],
        from: offset,
        size: limitNum,
        _source: ["timestamp", "filename", "thumb_filename", "url"],
      },
    });

    const total = typeof result.hits.total === "object"
      ? result.hits.total.value
      : result.hits.total;

    const snapshots = result.hits.hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
    }));

    res.json({
      snapshots,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return res.json({ snapshots: [], total: 0, page: 1, totalPages: 0 });
    }
    console.error("ES error:", error.message);
    res.status(500).json({ error: "Failed to fetch snapshots" });
  }
}
