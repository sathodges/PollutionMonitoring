import { useState } from "react";
import usePollutionData from "../hooks/usePollutionData.js";
import ControlsBar from "./ControlsBar.jsx";
import StatsCards from "./StatsCards.jsx";
import PollutionChart from "./PollutionChart.jsx";
import DataTable from "./DataTable.jsx";

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);

  const [feed, setFeed] = useState("2dot5");
  const [range, setRange] = useState("day");
  const [date, setDate] = useState(today);
  const [sort, setSort] = useState("newest");

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
