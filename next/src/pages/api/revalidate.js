export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await res.revalidate("/");

    const snapshotId = req.body?.snapshotId;
    if (snapshotId) {
      await res.revalidate(`/snapshot/${snapshotId}`);
    }

    return res.json({ revalidated: true });
  } catch (error) {
    console.error("Revalidation failed:", error.message);
    return res.status(500).json({ error: "Revalidation failed" });
  }
}
