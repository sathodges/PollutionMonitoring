import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ApiPoint, MonitorAvgPoint, Range } from "../hooks/usePollutionData";

type Props = {
  points: ApiPoint[];
  movingAvg: ApiPoint[];
  monitorAvgByTimeOfDay?: MonitorAvgPoint[];
  range: Range;
};

export function PollutionChart({
  points,
  movingAvg,
  monitorAvgByTimeOfDay,
  range,
}: Props) {
  const data = points.map((p, i) => ({
    time: formatLabel(p.timestamp, range),
    pollution: p.value,
    movingAvg: movingAvg[i]?.value ?? null,
  }));

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium">Pollution over time</h2>
        {range === "day" && monitorAvgByTimeOfDay && (
          <div className="text-xs text-slate-500">
            Monitor average by time-of-day used in stats
          </div>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="pollution"
              stroke="#64748b"
              dot={false}
              name="Pollution"
            />
            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="#0ea5e9"
              dot={false}
              name="Moving Avg"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function formatLabel(timestamp: string, range: Range) {
  const d = new Date(timestamp);
  if (range === "day") {
    return d.toTimeString().slice(0, 5); // HH:MM
  }
  if (range === "week") {
    return `${d.getDate()}/${d.getMonth() + 1} ${
      d.getHours() < 12 ? "AM" : "PM"
    }`;
  }
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
