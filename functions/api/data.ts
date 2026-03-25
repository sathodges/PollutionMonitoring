export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const feed = (url.searchParams.get("feed") || "2dot5") as "2dot5" | "10";
  const range = (url.searchParams.get("range") || "day") as
    | "day"
    | "week"
    | "month";
  const dateParam = url.searchParams.get("date"); // YYYY-MM-DD

  const targetDate = dateParam
    ? new Date(dateParam + "T00:00:00")
    : new Date();

  const adafruitUrl =
    feed === "10"
      ? "https://io.adafruit.com/CyCPollutionMonitor/feeds/cycnantgarw10"
      : "https://io.adafruit.com/CyCPollutionMonitor/feeds/cycnantgarw2dot5";

  const res = await fetch(adafruitUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    return jsonResponse(
      { error: "Failed to fetch data from Adafruit" },
      500
    );
  }

  const raw = (await res.json()) as any[];

  const points = raw
    .map((item) => ({
      timestamp: item.created_at ?? item.createdAt ?? item.time,
      value: Number(item.value),
    }))
    .filter((p) => p.timestamp && !Number.isNaN(p.value));

  const { filtered, windowStart, windowEnd } = filterByRange(
    points,
    range,
    targetDate
  );

  const aggregated = aggregateByRange(filtered, range);
  const movingAvg = computeMovingAverage(aggregated, 10);
  const stats = computeStats(aggregated);
  const monitorAvgByTimeOfDay =
    range === "day" ? computeMonitorAvgByTimeOfDay(points) : undefined;

  return jsonResponse({
    feed,
    range,
    date: targetDate.toISOString().slice(0, 10),
    windowStart,
    windowEnd,
    points: aggregated,
    movingAvg,
    monitorAvgByTimeOfDay,
    stats,
  });
};

type Point = { timestamp: string; value: number };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function filterByRange(points: Point[], range: string, targetDate: Date) {
  const end = endOfDay(targetDate);
  const start = startOfDay(targetDate);

  if (range === "week") {
    start.setDate(start.getDate() - 6);
  } else if (range === "month") {
    start.setDate(start.getDate() - 29);
  }

  const filtered = points.filter((p) => {
    const t = new Date(p.timestamp).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });

  return {
    filtered,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
  };
}

function aggregateByRange(points: Point[], range: string): Point[] {
  if (range === "day") {
    return points.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  const buckets = new Map<string, { sum: number; count: number; ts: number }>();

  for (const p of points) {
    const d = new Date(p.timestamp);
    let key: string;

    if (range === "week") {
      const half = d.getHours() < 12 ? "00-12" : "12-24";
      key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${half}`;
    } else {
      key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }

    const bucket = buckets.get(key) || {
      sum: 0,
      count: 0,
      ts: d.getTime(),
    };
    bucket.sum += p.value;
    bucket.count += 1;
    bucket.ts = Math.min(bucket.ts, d.getTime());
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .map(([_, { sum, count, ts }]) => ({
      timestamp: new Date(ts).toISOString(),
      value: sum / count,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function computeMovingAverage(points: Point[], windowSize: number): Point[] {
  const result: Point[] = [];
  let sum = 0;
  const values = points.map((p) => p.value);

  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= windowSize) sum -= values[i - windowSize];
    const avg = i >= windowSize - 1 ? sum / windowSize : values[i];
    result.push({ timestamp: points[i].timestamp, value: avg });
  }

  return result;
}

function computeStats(points: Point[]) {
  if (!points.length) {
    return { average: 0, min: 0, max: 0, latest: null };
  }
  const values = points.map((p) => p.value);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    average: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    latest: values[values.length - 1],
  };
}

function computeMonitorAvgByTimeOfDay(points: Point[]) {
  const buckets = new Map<string, { sum: number; count: number }>();

  for (const p of points) {
    const d = new Date(p.timestamp);
    const key = `${String(d.getHours()).padStart(2, "0")}:00`;
    const bucket = buckets.get(key) || { sum: 0, count: 0 };
    bucket.sum += p.value;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .map(([timeOfDay, { sum, count }]) => ({
      timeOfDay,
      value: sum / count,
    }))
    .sort((a, b) => (a.timeOfDay < b.timeOfDay ? -1 : 1));
}
