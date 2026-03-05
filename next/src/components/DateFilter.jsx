export default function DateFilter({ from, to, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-gray-600">
        From:
        <input
          type="date"
          value={from || ""}
          onChange={(e) => onChange({ from: e.target.value || null, to })}
          className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
      </label>
      <label className="text-sm text-gray-600">
        To:
        <input
          type="date"
          value={to || ""}
          onChange={(e) => onChange({ from, to: e.target.value || null })}
          className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
      </label>
      {(from || to) && (
        <button
          onClick={() => onChange({ from: null, to: null })}
          className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
