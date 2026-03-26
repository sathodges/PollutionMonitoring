export default function StatsCards({ stats }) {
  const items = [
    { label: "Average", value: stats.average },
    { label: "Minimum", value: stats.min },
    { label: "Maximum", value: stats.max },
    { label: "Latest", value: stats.latest ?? 0 },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border bg-white dark:bg-slate-800 px-3 py-2"
        >
          <div className="text-xs text-slate-500">{item.label}</div>
          <div className="text-lg font-semibold">{item.value.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
