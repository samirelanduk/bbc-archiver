import SnapshotCard from "./SnapshotCard";

export default function SnapshotGrid({ snapshots }) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">
        No snapshots yet. The worker will capture the first one shortly.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {snapshots.map((snapshot) => (
        <SnapshotCard key={snapshot.id} snapshot={snapshot} />
      ))}
    </div>
  );
}
