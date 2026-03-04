import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import SnapshotGrid from "@/components/SnapshotGrid";
import Pagination from "@/components/Pagination";
import DateFilter from "@/components/DateFilter";
import { fetchSnapshots, searchSnapshots, formatDate, formatDateShort } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const searchQuery = router.query.q || "";

  const [snapshots, setSnapshots] = useState([]);
  const [latest, setLatest] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchPage, setSearchPage] = useState(1);

  // Reset search page when query changes
  useEffect(() => {
    setSearchPage(1);
  }, [searchQuery]);

  // Load browse snapshots
  const loadBrowse = useCallback(async () => {
    if (searchQuery) return;
    setLoading(true);
    try {
      const data = await fetchSnapshots({
        page,
        limit: 20,
        from: dateFilter.from,
        to: dateFilter.to,
      });
      setSnapshots(data.snapshots);
      setTotalPages(data.totalPages);
      if (page === 1 && !dateFilter.from && !dateFilter.to && data.snapshots.length > 0) {
        setLatest(data.snapshots[0]);
      }
    } catch {
      console.error("Failed to load snapshots");
    } finally {
      setLoading(false);
    }
  }, [page, dateFilter, searchQuery]);

  // Load search results
  const loadSearch = useCallback(async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const data = await searchSnapshots(searchQuery, searchPage);
      setSearchResults(data.results);
      setSearchTotal(data.total);
      setSearchTotalPages(data.totalPages);
    } catch {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchPage]);

  useEffect(() => {
    if (searchQuery) {
      loadSearch();
    } else {
      loadBrowse();
    }
  }, [loadBrowse, loadSearch, searchQuery]);

  function handleDateChange(newFilter) {
    setDateFilter(newFilter);
    setPage(1);
  }

  function handleSearchPageChange(newPage) {
    setSearchPage(newPage);
  }

  // Search results view
  if (searchQuery) {
    return (
      <Layout>
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
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

            <Pagination page={searchPage} totalPages={searchTotalPages} onPageChange={handleSearchPageChange} />
          </div>
        )}
      </Layout>
    );
  }

  // Browse view
  return (
    <Layout>
      {latest && (
        <section className="mb-10">
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
      )}

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Snapshots</h2>
          <DateFilter from={dateFilter.from} to={dateFilter.to} onChange={handleDateChange} />
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading...</p>
        ) : (
          <>
            <SnapshotGrid snapshots={snapshots} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </section>
    </Layout>
  );
}
