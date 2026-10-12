import SummaryCard from "../dashboard/SummaryCard";
import type { QueueEntry } from "../../types/queue";

interface Props {
  entries: QueueEntry[];
}

export default function WaitingTimePerformance({ entries }: Props) {
  // Actual waiting time is only meaningful for patients who were called
  // (set on WAITING→CALLED transition). WAITING entries always carry actualWaitingTime=0,
  // and IN_CONSULTATION entries haven't been completed yet — exclude both to keep stats accurate.
  const validAwtEntries = entries.filter(
    (e) =>
      e.status !== "WAITING" &&
      e.status !== "IN_CONSULTATION" &&
      typeof e.actualWaitingTime === "number" &&
      !isNaN(e.actualWaitingTime) &&
      e.actualWaitingTime >= 0
  );

  const totalValid = validAwtEntries.length;

  let avgDisplay = "—";
  let maxDisplay = "—";
  let minDisplay = "—";

  if (totalValid > 0) {
    const times = validAwtEntries.map((e) => e.actualWaitingTime);
    const sum = times.reduce((acc, t) => acc + t, 0);
    const avg = Math.round(sum / totalValid);
    const max = Math.max(...times);
    const min = Math.min(...times);

    avgDisplay = `${avg} min`;
    maxDisplay = `${max} min`;
    minDisplay = `${min} min`;
  }

  // Distribution buckets
  const b0_15 = validAwtEntries.filter((e) => e.actualWaitingTime <= 15).length;
  const b16_30 = validAwtEntries.filter(
    (e) => e.actualWaitingTime >= 16 && e.actualWaitingTime <= 30
  ).length;
  const b31_60 = validAwtEntries.filter(
    (e) => e.actualWaitingTime >= 31 && e.actualWaitingTime <= 60
  ).length;
  const b60plus = validAwtEntries.filter((e) => e.actualWaitingTime > 60).length;

  const getPercent = (count: number) => (totalValid > 0 ? (count / totalValid) * 100 : 0);

  const buckets = [
    { label: "0–15 min", count: b0_15, color: "bg-emerald-500" },
    { label: "16–30 min", count: b16_30, color: "bg-blue-500" },
    { label: "31–60 min", count: b31_60, color: "bg-amber-500" },
    { label: "60+ min", count: b60plus, color: "bg-rose-500" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
      <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">
        Waiting Time Performance
      </h3>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Average Waiting Time"
          value={avgDisplay}
          valueColor="text-blue-700"
          icon="⏱️"
        />
        <SummaryCard
          label="Longest Waiting Time"
          value={maxDisplay}
          valueColor="text-rose-700"
          icon="⏳"
        />
        <SummaryCard
          label="Minimum Waiting Time"
          value={minDisplay}
          valueColor="text-emerald-700"
          icon="⚡"
        />
      </div>

      {/* Waiting Time Range Breakdown */}
      <div className="space-y-4 pt-2">
        <h4 className="text-sm font-semibold text-gray-700">
          Actual Waiting Time Ranges ({totalValid} called/completed patients)
        </h4>

        {totalValid === 0 ? (
          <p className="text-sm text-gray-400 py-3 text-center">
            No actual waiting time data available yet.
          </p>
        ) : (
          <div className="space-y-3">
            {buckets.map((b) => {
              const pct = getPercent(b.count);
              return (
                <div key={b.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">{b.label}</span>
                    <span className="font-semibold text-gray-800">
                      {b.count} {b.count === 1 ? "patient" : "patients"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${b.color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
