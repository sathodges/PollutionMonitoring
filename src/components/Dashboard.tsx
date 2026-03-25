import { useState } from "react";
import { usePollutionData, Feed, Range } from "../hooks/usePollutionData";
import { ControlsBar } from "./ControlsBar";
import { StatsCards } from "./StatsCards";
import { PollutionChart } from "./PollutionChart";
import { DataTable } from "./DataTable";

export function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);

  const [feed, setFeed] = useState<Feed>("2dot5");
  const [range, setRange] = useState<Range>("day");
  const [date, setDate] = useState<string>(today);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data, loading } = usePollutionData(feed, range, date);

  return (
    <div className="space-y-6">
      <ControlsBar
        feed={feed}
        onFeedChange={setFeed}
        range={range}
        onRangeChange={setRange}
        date={date}
        onDateChange={setDate}
        sort={sort}
        onSortChange={setSort}
      />

      {loading && <div className="text-sm text-slate-500">Loading…</div>}

      {data && (
        <>
          <StatsCards stats={data.stats} />

          <PollutionChart
            points={data.points}
            movingAvg={data.movingAvg}
            monitorAvgByTimeOfDay={data.monitorAvgByTimeOfDay}
            range={range}
          />

          <DataTable points={data.points} sort={sort} />
        </>
      )}
    </div>
  );
}
