import PriorityBadge from "../dashboard/PriorityBadge";
import StatusBadge from "../dashboard/StatusBadge";
import QueueActionButtons from "./QueueActionButtons";
import type { QueueEntry, QueueEntryStatus } from "../../types/queue";

interface PendingMap {
  [entryId: string]: QueueEntryStatus | null;
}

interface Props {
  entries: QueueEntry[];
  pendingMap: PendingMap;
  onAction: (entryId: string, targetStatus: QueueEntryStatus) => void;
}

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function QueueManagementTable({ entries, pendingMap, onAction }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-14 text-gray-400">
        <div className="text-5xl mb-3">🪑</div>
        <p className="text-base font-medium text-gray-500">
          No patients currently in this queue.
        </p>
        <p className="text-sm mt-1">
          Entries will appear here once patients join the queue.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Pos.", "Queue No.", "Priority", "Status", "Est. Wait", "Joined At", "Actions"].map((col) => (
              <th
                key={col}
                scope="col"
                className="px-4 py-3.5 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {entries.map((entry, index) => {
            const isPending = pendingMap[entry._id] != null;
            return (
              <tr
                key={entry._id}
                className={`transition-colors ${isPending ? "bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <td className="px-4 py-4 text-base font-semibold text-gray-600 whitespace-nowrap">
                  {entry.position != null ? entry.position : index + 1}
                </td>
                <td className="px-4 py-4 text-base text-gray-800 whitespace-nowrap">
                  #{entry.queueNumber}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <PriorityBadge priority={entry.priority} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="px-4 py-4 text-base text-gray-700 whitespace-nowrap">
                  {entry.estimatedWaitingTime > 0
                    ? `${entry.estimatedWaitingTime} min`
                    : "< 1 min"}
                </td>
                {/* Joined at — kept at text-sm to save column width */}
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {fmtDateTime(entry.joinedAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <QueueActionButtons
                    entryId={entry._id}
                    currentStatus={entry.status}
                    pendingStatus={pendingMap[entry._id] ?? null}
                    onAction={onAction}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
