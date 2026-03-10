import Link from "next/link";
import Layout from "@/components/Layout";
import { getSnapshot } from "@/lib/elasticsearch";
import { formatDate } from "@/lib/api";

export async function getServerSideProps({ params }) {
  try {
    const { text_content, ...snapshot } = await getSnapshot(params.id);
    return { props: { snapshot } };
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      return { notFound: true };
    }
    return { props: { snapshot: null } };
  }
}

export default function SnapshotDetail({ snapshot }) {
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
        <Link href="/browse" className="text-sm text-teal-600 hover:text-teal-700 transition-colors">
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

    </Layout>
  );
}
