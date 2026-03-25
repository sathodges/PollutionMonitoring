import { Feed, Range } from "../hooks/usePollutionData";

type Props = {
  feed: Feed;
  onFeedChange: (f: Feed) => void;
  range: Range;
  onRangeChange: (r: Range) => void;
  date: string;
  onDateChange: (d: string) => void;
  sort: "newest" | "oldest";
  onSortChange: (s: "newest" | "oldest") => void;
};

export function ControlsBar({
  feed,
  onFeedChange,
  range,
  onRangeChange,
  date,
  onDateChange,
  sort,
  onSortChange,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4 items-end">
      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Feed</label>
        <select
          value={feed}
          onChange={(e) => onFeedChange(e.target.value as Feed)}
          className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
        >
          <option value="2dot5">PM 2.5</option>
          <option value="10">PM 10</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Range</label>
        <div className="inline-flex rounded border border-slate-300 dark:border-slate-600 overflow-hidden text-sm">
          {(["day", "week", "month"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1 ${
                range === r
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              {r[0].toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium mb-1">Sort</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as "newest" | "oldest")}
          className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
