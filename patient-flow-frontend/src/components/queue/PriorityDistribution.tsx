import PriorityBadge from "../dashboard/PriorityBadge";
import type { QueueEntry } from "../../types/queue";

interface Props {
  entries: QueueEntry[];
}

export default function PriorityDistribution({ entries }: Props) {
  const total = entries.length;

  const emergencyCount = entries.filter((e) => e.priority === 1).length;
  const urgentCount = entries.filter((e) => e.priority === 2).length;
  const normalCount = entries.filter((e) => e.priority === 3).length;

  const getPercent = (count: number) => (total > 0 ? (count / total) * 100 : 0);

  const items = [
    { priority: 1 as const, count: emergencyCount, barColor: "bg-red-500" },
    { priority: 2 as const, count: urgentCount, barColor: "bg-orange-500" },
    { priority: 3 as const, count: normalCount, barColor: "bg-green-500" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
      <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">
        Patient Priority Distribution
      </h3>

      {total === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No priority data available.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const pct = getPercent(item.count);
            return (
              <div key={item.priority} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <span className="font-semibold text-gray-700">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${item.barColor} transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
