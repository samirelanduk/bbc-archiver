import { Client } from "@elastic/elasticsearch";

const es = new Client({
  node: process.env.ELASTICSEARCH_HOST || "http://elasticsearch:9200",
});

export default async function handler(req, res) {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q) {
    return res.json({ results: [], total: 0, page: 1, totalPages: 0 });
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  try {
    const result = await es.search({
      index: "snapshots",
      body: {
        query: {
          match: {
            text_content: {
              query: q,
              operator: "and",
            },
          },
        },
        highlight: {
          fields: {
            text_content: {
              fragment_size: 200,
              number_of_fragments: 2,
              pre_tags: ["<mark>"],
              post_tags: ["</mark>"],
            },
          },
        },
        sort: [{ _score: { order: "desc" } }, { timestamp: { order: "desc" } }],
        from: offset,
        size: limitNum,
        _source: ["timestamp", "filename", "thumb_filename", "url"],
      },
    });

    const total = typeof result.hits.total === "object"
      ? result.hits.total.value
      : result.hits.total;

    const results = result.hits.hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
      highlight: hit.highlight?.text_content?.join(" ... ") || null,
    }));

    res.json({
      results,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return res.json({ results: [], total: 0, page: 1, totalPages: 0 });
    }
    console.error("ES error:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
}
