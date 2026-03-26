export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const feed = url.searchParams.get("feed") || "2dot5";
  const range = url.searchParams.get("range") || "day";
  const dateParam = url.searchParams.get("date");

  const targetDate = dateParam
    ? new Date(dateParam + "T00:00:00")
    : new Date();

  const adafruitUrl =
    feed === "10"
      ? "https://io.adafruit.com/CyCPollutionMonitor/feeds/cycnantgarw10"
      : "https://io.adafruit.com/CyCPollutionMonitor/feeds/cycnantgarw2dot5";

  const res = await fetch(adafruitUrl, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch Adafruit data" }),
      { status: 500 }
    );
  }

  const raw = await res.json();

  const points = raw
    .map((item) => ({
      timestamp: item.created_at,
      value: Number(item.value),
    }))
    .filter((p) => p.timestamp && !isNaN(p.value));

  const { filtered } = filterByRange(points, range, targetDate);
  const aggregated = aggregateByRange(filtered, range);
  const movingAvg = computeMovingAverage(aggregated, 10);
  const stats = computeStats(aggregated);
  const monitorAvgByTimeOfDay =
    range === "day" ? computeMonitorAvgByTimeOfDay(points) : undefined;

  return new Response(
    JSON.stringify({
      feed,
      range,
      date: targetDate.toISOString().slice(0, 10),
      points: aggregated,
      movingAvg,
      monitorAvgByTimeOfDay,
      stats,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

/* -------------------------------------------------------
   RANGE FILTERING
------------------------------------------------------- */

function filterByRange(points, range, targetDate) {
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  if (range === "week") start.setDate(start.getDate() - 6);
  if (range === "month") start.setDate(start.getDate() - 29);

  const filtered = points.filter((p) => {
    const t = new Date(p.timestamp).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });

  return { filtered };
}

/* -------------------------------------------------------
   AGGREGATION
------------------------------------------------------- */

function aggregateByRange(points, range) {
  if (range === "day") {
    return points.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }

  const buckets = new Map();

  for (const p of points) {
    const d = new Date(p.timestamp);
    let key;

    if (range === "week") {
      key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${
        d.getHours() < 12 ? "AM" : "PM"
      }`;
    } else {
      key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }

    const bucket = buckets.get(key) || { sum: 0, count: 0, ts: d.getTime() };
    bucket.sum += p.value;
    bucket.count++;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .map(([_, b]) => ({
      timestamp: new Date(b.ts).toISOString(),
      value: b.sum / b.count,
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/* -------------------------------------------------------
   MOVING AVERAGE
------------------------------------------------------- */

function computeMovingAverage(points, windowSize) {
  const result = [];
  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    sum += points[i].value;
    if (i >= windowSize) sum -= points[i - windowSize].value;

    const avg = i >= windowSize - 1 ? sum / windowSize : points[i].value;
    result.push({ timestamp: points[i].timestamp, value: avg });
  }

  return result;
}

/* -------------------------------------------------------
   STATS
------------------------------------------------------- */

function computeStats(points) {
  if (!points.length) {
    return { average: 0, min: 0, max: 0, latest: null };
  }

  const values = points.map((p) => p.value);

  return {
    average: values.reduce((a, b) => a + b, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    latest: values[values.length - 1],
  };
}

/* -------------------------------------------------------
   MONITOR AVERAGE BY TIME OF DAY
------------------------------------------------------- */

function computeMonitorAvgByTimeOfDay(points) {
  const buckets = new Map();

  for (const p of points) {
    const d = new Date(p.timestamp);
    const key = `${String(d.getHours()).padStart(2, "0")}:00`;

    const bucket = buckets.get(key) || { sum: 0, count: 0 };
    bucket.sum += p.value;
    bucket.count++;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .map(([timeOfDay, b]) => ({
      timeOfDay,
      value: b.sum / b.count,
    }))
    .sort((a, b) => (a.timeOfDay < b.timeOfDay ? -1 : 1));
}
