import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import { fetchSnapshot, formatDate } from "@/lib/api";

export default function SnapshotDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [snapshot, setSnapshot] = useState(null);
  const [showText, setShowText] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSnapshot(id)
      .then(setSnapshot)
      .catch(() => console.error("Failed to load snapshot"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500 text-center py-12">Loading...</p>
      </Layout>
    );
  }

  if (!snapshot) {
    return (
      <Layout>
        <p className="text-gray-500 text-center py-12">Snapshot not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
          &larr; Back to archive
        </Link>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Snapshot</h1>
          <p className="text-sm text-gray-500">{formatDate(snapshot.timestamp)}</p>
        </div>
        <div className="flex gap-3">
          {snapshot.prev && (
            <Link
              href={`/snapshot/${snapshot.prev}`}
              className="px-4 py-2 text-sm rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              &larr; Previous
            </Link>
          )}
          {snapshot.next && (
            <Link
              href={`/snapshot/${snapshot.next}`}
              className="px-4 py-2 text-sm rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Next &rarr;
            </Link>
          )}
        </div>
      </div>

      <img
        src={`/snapshots/${snapshot.filename}`}
        alt={`BBC News snapshot from ${formatDate(snapshot.timestamp)}`}
        className="w-full rounded-lg shadow-md border border-gray-200 mb-6"
      />

      <div>
        <button
          onClick={() => setShowText(!showText)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors mb-4"
        >
          {showText ? "Hide" : "Show"} extracted text
        </button>
        {showText && (
          <div className="prose prose-sm max-w-none bg-white rounded-lg border border-gray-200 p-6 whitespace-pre-wrap text-gray-700">
            {snapshot.text_content}
          </div>
        )}
      </div>
    </Layout>
  );
}
