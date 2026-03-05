import { Client } from "@elastic/elasticsearch";

const es = new Client({
  node: process.env.ELASTICSEARCH_HOST || "http://elasticsearch:9200",
});

export async function getSnapshots({ page = 1, limit = 20, from, to } = {}) {
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

    return { snapshots, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return { snapshots: [], total: 0, page: 1, totalPages: 0 };
    }
    throw error;
  }
}

export async function getSnapshot(id) {
  const result = await es.get({ index: "snapshots", id });
  const snapshot = { id: result._id, ...result._source };

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

  return snapshot;
}

export async function getAllSnapshotIds() {
  try {
    const result = await es.search({
      index: "snapshots",
      body: {
        query: { match_all: {} },
        sort: [{ timestamp: { order: "desc" } }],
        size: 10000,
        _source: false,
      },
    });
    return result.hits.hits.map((hit) => hit._id);
  } catch (error) {
    if (error.meta?.statusCode === 404) return [];
    throw error;
  }
}

export async function searchIndex(q, page = 1, limit = 20) {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  try {
    const result = await es.search({
      index: "snapshots",
      body: {
        query: {
          match: {
            text_content: { query: q, operator: "and" },
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

    return { results, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return { results: [], total: 0, page: 1, totalPages: 0 };
    }
    throw error;
  }
}
