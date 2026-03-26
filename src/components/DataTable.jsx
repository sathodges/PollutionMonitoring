import { useState } from "react";

export default function DataTable({ points, sort }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const sorted = [...points].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    return sort === "newest" ? tb - ta : ta - tb;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 p-4 space-y-3">
      <h2 className="text-sm mb-2">Readings</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs border-b">
            <th className="py-1">Time</th>
            <th className="py-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((p, i) => {
            const d = new Date(p.timestamp);
            return (
              <tr key={i} className="border-b">
                <td className="py-1">{d.toTimeString().slice(0, 8)}</td>
                <td className="py-1">{p.value.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`px-2 py-1 text-xs rounded ${
              n === page ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
