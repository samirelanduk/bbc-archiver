import fs from "fs";
import path from "path";

const SNAPSHOTS_DIR = "/data/snapshots";

export default function handler(req, res) {
  const filePath = path.join(SNAPSHOTS_DIR, ...req.query.path);

  if (!filePath.startsWith(SNAPSHOTS_DIR)) {
    return res.status(403).end();
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).end();
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "application/octet-stream";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  fs.createReadStream(filePath).pipe(res);
}
