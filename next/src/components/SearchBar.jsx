import { useState } from "react";
import { useRouter } from "next/router";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search snapshots..."
        className="px-3 py-1.5 rounded-l-md text-sm text-gray-900 bg-slate-100 border-0 focus:ring-2 focus:ring-teal-500 focus:outline-none w-48"
      />
      <button
        type="submit"
        className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-r-md hover:bg-teal-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
