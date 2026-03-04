import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import SnapshotGrid from "@/components/SnapshotGrid";
import Pagination from "@/components/Pagination";
import DateFilter from "@/components/DateFilter";
import { fetchSnapshots } from "@/lib/api";

export default function Browse() {
  const [snapshots, setSnapshots] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSnapshots({
        page,
        limit: 24,
        from: dateFilter.from,
        to: dateFilter.to,
      });
      setSnapshots(data.snapshots);
      setTotalPages(data.totalPages);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Snapshots</h1>
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
    </Layout>
  );
}
