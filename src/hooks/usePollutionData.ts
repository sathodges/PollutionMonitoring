import { useEffect, useState } from "react";

export type Range = "day" | "week" | "month";
export type Feed = "2dot5" | "10";

export type ApiPoint = { timestamp: string; value: number };
export type MonitorAvgPoint = { timeOfDay: string; value: number };

export type ApiResponse = {
  feed: Feed;
  range: Range;
  date: string;
  windowStart: string;
  windowEnd: string;
  points: ApiPoint[];
  movingAvg: ApiPoint[];
  monitorAvgByTimeOfDay?: MonitorAvgPoint[];
  stats: {
    average: number;
    min: number;
    max: number;
    latest: number | null;
  };
};

export function usePollutionData(feed: Feed, range: Range, date: string) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({ feed, range, date });
      const res = await fetch(`/api/data?${params.toString()}`);
      const json = (await res.json()) as ApiResponse;
      if (!cancelled) {
        setData(json);
        setLoading(false);
      }
    };

    fetchData();

    const isToday = date === new Date().toISOString().slice(0, 10);
    const interval =
      range === "day" && isToday ? setInterval(fetchData, 60_000) : null;

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [feed, range, date]);

  return { data, loading };
}
