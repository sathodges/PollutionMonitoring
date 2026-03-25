import { useState } from "react";
import { ApiPoint } from "../hooks/usePollutionData";

type Props = {
  points: ApiPoint[];
  sort: "newest" | "oldest";
};

const PAGE_SIZE = 12;

export function DataTable({ points, sort }: Props) {
  const [page, setPage] = useState(1);

  const sorted = [...points].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    return sort === "newest" ? tb - ta : ta - tb;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
      <h2 className="text-sm font-medium mb-2">Readings</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700">
            <th className="py-1">Time</th>
            <th className="py-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((p, idx) => {
            const d = new Date(p.timestamp);
            const time = d.toTimeString().slice(0, 8); // HH:MM:SS
            return (
              <tr
                key={idx}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-1">{time}</td>
                <td className="py-1">{p.value.toFixed(1)}</td>
              </tr>
            );
          })}
          {!pageItems.length && (
            <tr>
              <td
                colSpan={2}
                className="py-2 text-center text-xs text-slate-500"
              >
                No data for this range.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-center gap-1 mt-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`px-2 py-1 text-xs rounded ${
              n === page
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 dark:bg-slate-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
