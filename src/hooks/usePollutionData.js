import { useEffect, useState } from "react";

export default function usePollutionData(feed, range, date) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({ feed, range, date });
      const res = await fetch(`/api/data?${params.toString()}`);
      const json = await res.json();
      if (!cancelled) {
        setData(json);
        setLoading(false);
      }
    };

    fetchData();

    const isToday = date === new Date().toISOString().slice(0, 10);
    const interval =
      range === "day" && isToday ? setInterval(fetchData, 60000) : null;

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [feed, range, date]);

  return { data, loading };
}
