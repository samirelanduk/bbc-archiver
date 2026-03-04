import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import Pagination from "@/components/Pagination";
import { searchSnapshots, formatDateShort } from "@/lib/api";

export default function Search() {
  const router = useRouter();
  const { q, page: pageParam } = router.query;
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const page = parseInt(pageParam) || 1;

  useEffect(() => {
    if (q) setQuery(q);
  }, [q]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    searchSnapshots(q, page)
      .then((data) => {
        setResults(data.results);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => console.error("Search failed"))
      .finally(() => setLoading(false));
  }, [q, page]);

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handlePageChange(newPage) {
    router.push(`/search?q=${encodeURIComponent(q)}&page=${newPage}`);
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Snapshots</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search extracted text..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-500">Searching...</p>}

      {!loading && q && (
        <div>
          <p className="text-sm text-gray-500 mb-6">
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>

          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No results found.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/snapshots/${result.id}`}
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

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </Layout>
  );
}
