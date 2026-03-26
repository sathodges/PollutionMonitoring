import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function PollutionChart({
  points,
  movingAvg,
  monitorAvgByTimeOfDay,
  range,
}) {
  const data = points.map((p, i) => ({
    time: formatLabel(p.timestamp, range),
    pollution: p.value,
    movingAvg: movingAvg[i]?.value ?? null,
  }));

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 p-4">
      <h2 className="text-sm mb-2">Pollution over time</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pollution" stroke="#64748b" dot={false} />
            <Line type="monotone" dataKey="movingAvg" stroke="#0ea5e9" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function formatLabel(ts, range) {
  const d = new Date(ts);
  if (range === "day") return d.toTimeString().slice(0, 5);
  if (range === "week")
    return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours() < 12 ? "AM" : "PM"}`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
