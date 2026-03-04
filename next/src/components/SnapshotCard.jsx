import Link from "next/link";
import { formatDateShort } from "@/lib/api";

export default function SnapshotCard({ snapshot }) {
  return (
    <Link href={`/snapshots/${snapshot.id}`} className="group block">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={`/snapshots/${snapshot.thumb_filename}`}
            alt={`BBC News snapshot from ${formatDateShort(snapshot.timestamp)}`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3">
          <p className="text-sm text-gray-600">{formatDateShort(snapshot.timestamp)}</p>
        </div>
      </div>
    </Link>
  );
}
