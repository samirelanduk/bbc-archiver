import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import Pagination from "@/components/Pagination";
import { getSnapshots } from "@/lib/elasticsearch";
import { searchSnapshots, formatDate, formatDateShort } from "@/lib/api";

export async function getStaticProps() {
  try {
    const data = await getSnapshots({ page: 1, limit: 1 });
    const latest = data.snapshots[0] || null;
    return {
      props: { latest },
      revalidate: latest ? false : 60,
    };
  } catch {
    return { props: { latest: null }, revalidate: 60 };
  }
}

export default function Home({ latest }) {
  const router = useRouter();
  const searchQuery = router.query.q || "";

  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery) return;
    setLoading(true);
    searchSnapshots(searchQuery, searchPage)
      .then((data) => {
        setSearchResults(data.results);
        setSearchTotal(data.total);
        setSearchTotalPages(data.totalPages);
      })
      .catch(() => console.error("Search failed"))
      .finally(() => setLoading(false));
  }, [searchQuery, searchPage]);

  if (searchQuery) {
    return (
      <Layout>
        <div className="mb-6">
          <Link href="/" className="text-sm text-teal-600 hover:text-teal-700 transition-colors">
            &larr; Back to archive
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-12">Searching...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-6">
              {searchTotal} result{searchTotal !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </p>

            {searchResults.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No results found.</p>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/snapshot/${result.id}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <img
                        src={`/snapshots/${result.thumb_filename}`}
                        alt=""
                        className="w-32 h-24 object-cover object-top rounded flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {formatDateShort(result.timestamp)}
                        </p>
                        {result.highlight && (
                          <p
                            className="text-sm text-gray-600 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: result.highlight }}
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Pagination page={searchPage} totalPages={searchTotalPages} onPageChange={setSearchPage} />
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      {latest ? (
        <section>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Latest Snapshot</h1>
          <p className="text-sm text-gray-500 mb-4">{formatDate(latest.timestamp)}</p>
          <a href={`/snapshot/${latest.id}`}>
            <img
              src={`/snapshots/${latest.filename}`}
              alt="Latest BBC News snapshot"
              className="w-full max-w-4xl rounded-lg shadow-md border border-gray-200"
            />
          </a>
        </section>
      ) : (
        <p className="text-gray-500 text-center py-12">
          No snapshots yet. The worker will capture the first one shortly.
        </p>
      )}
    </Layout>
  );
}
