const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;
const SNAPSHOT_ID_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}[A-Za-z0-9+.\-]*$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!REVALIDATION_SECRET || req.headers["x-revalidation-secret"] !== REVALIDATION_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await res.revalidate("/");

    const snapshotId = req.body?.snapshotId;
    if (snapshotId && SNAPSHOT_ID_PATTERN.test(snapshotId)) {
      await res.revalidate(`/snapshot/${snapshotId}`);
    }

    return res.json({ revalidated: true });
  } catch (error) {
    console.error("Revalidation failed:", error.message);
    return res.status(500).json({ error: "Revalidation failed" });
  }
}
