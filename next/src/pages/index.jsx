import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import SnapshotGrid from "@/components/SnapshotGrid";
import Pagination from "@/components/Pagination";
import DateFilter from "@/components/DateFilter";
import { fetchSnapshots, formatDate } from "@/lib/api";

export default function Home() {
  const [snapshots, setSnapshots] = useState([]);
  const [latest, setLatest] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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
  }, [page, dateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function handleDateChange(newFilter) {
    setDateFilter(newFilter);
    setPage(1);
  }

  return (
    <Layout>
      {latest && (
        <section className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Latest Snapshot</h1>
          <p className="text-sm text-gray-500 mb-4">{formatDate(latest.timestamp)}</p>
          <a href={`/snapshots/${latest.id}`}>
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
