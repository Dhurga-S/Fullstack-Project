import StatusBadge from "../dashboard/StatusBadge";
import type { QueueEntry, QueueEntryStatus } from "../../types/queue";

interface Props {
  entries: QueueEntry[];
}

const statusList: { status: QueueEntryStatus; barColor: string }[] = [
  { status: "WAITING", barColor: "bg-blue-500" },
  { status: "CALLED", barColor: "bg-yellow-500" },
  { status: "IN_CONSULTATION", barColor: "bg-purple-500" },
  { status: "COMPLETED", barColor: "bg-green-500" },
  { status: "NO_SHOW", barColor: "bg-gray-400" },
  { status: "CANCELLED", barColor: "bg-red-500" },
];

export default function StatusDistribution({ entries }: Props) {
  const total = entries.length;

  const counts: Record<QueueEntryStatus, number> = {
    WAITING: entries.filter((e) => e.status === "WAITING").length,
    CALLED: entries.filter((e) => e.status === "CALLED").length,
    IN_CONSULTATION: entries.filter((e) => e.status === "IN_CONSULTATION").length,
    COMPLETED: entries.filter((e) => e.status === "COMPLETED").length,
    NO_SHOW: entries.filter((e) => e.status === "NO_SHOW").length,
    CANCELLED: entries.filter((e) => e.status === "CANCELLED").length,
  };

  const getPercent = (count: number) => (total > 0 ? (count / total) * 100 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
      <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">
        Queue Status Distribution
      </h3>

      {total === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No status data available.</p>
      ) : (
        <div className="space-y-3.5">
          {statusList.map(({ status, barColor }) => {
            const count = counts[status];
            const pct = getPercent(count);
            return (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <StatusBadge status={status} />
                  <span className="font-semibold text-gray-700">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${barColor} transition-all duration-300`}
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
