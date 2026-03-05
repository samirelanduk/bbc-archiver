import Layout from "@/components/Layout";
import SnapshotGrid from "@/components/SnapshotGrid";
import Pagination from "@/components/Pagination";
import DateFilter from "@/components/DateFilter";
import { getSnapshots } from "@/lib/elasticsearch";
import { useRouter } from "next/router";

export async function getServerSideProps({ query }) {
  const { page = 1, from, to } = query;
  try {
    const data = await getSnapshots({ page, limit: 24, from, to });
    return { props: { ...data, from: from || null, to: to || null } };
  } catch {
    return { props: { snapshots: [], total: 0, page: 1, totalPages: 0, from: null, to: null } };
  }
}

export default function Browse({ snapshots, page, totalPages, from, to }) {
  const router = useRouter();

  function handleDateChange({ from: newFrom, to: newTo }) {
    const query = {};
    if (newFrom) query.from = newFrom;
    if (newTo) query.to = newTo;
    router.push({ pathname: "/browse", query });
  }

  function handlePageChange(newPage) {
    const query = { page: newPage };
    if (from) query.from = from;
    if (to) query.to = to;
    router.push({ pathname: "/browse", query });
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Snapshots</h1>
        <DateFilter from={from} to={to} onChange={handleDateChange} />
      </div>

      <SnapshotGrid snapshots={snapshots} />
      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </Layout>
  );
}
