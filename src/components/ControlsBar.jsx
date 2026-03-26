export default function ControlsBar({
  feed,
  onFeedChange,
  range,
  onRangeChange,
  date,
  onDateChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4 items-end">
      <div className="flex flex-col">
        <label className="text-xs mb-1">Feed</label>
        <select
          value={feed}
          onChange={(e) => onFeedChange(e.target.value)}
          className="rounded border px-2 py-1 text-sm bg-white dark:bg-slate-800"
        >
          <option value="2dot5">PM 2.5</option>
          <option value="10">PM 10</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded border px-2 py-1 text-sm bg-white dark:bg-slate-800"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs mb-1">Range</label>
        <div className="inline-flex rounded border overflow-hidden text-sm">
          {["day", "week", "month"].map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1 ${
                range === r
                  ? "bg-slate-900 text-white"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-xs mb-1">Sort</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded border px-2 py-1 text-sm bg-white dark:bg-slate-800"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
