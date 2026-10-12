import PriorityBadge from "../dashboard/PriorityBadge";
import StatusBadge from "../dashboard/StatusBadge";
import type { QueueEntry } from "../../types/queue";

interface Props {
  entries: QueueEntry[];
}

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function formatAwt(awt?: number): string {
  if (typeof awt !== "number" || isNaN(awt) || awt < 0) return "—";
  return `${awt} min`;
}

export default function QueueHistoryTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-base font-medium">No queue history available.</p>
        <p className="text-sm text-gray-400 mt-1">
          Select a queue to load historical completed, no-show, or cancelled entries.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-gray-700">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {["Queue Number", "Priority", "Status", "Joined At", "Called At", "Actual Wait", "Finalized At"].map((col) => (
              <th key={col} scope="col" className="px-5 py-3.5 text-sm font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {entries.map((entry) => (
            <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4 text-base font-bold text-gray-900 whitespace-nowrap">
                #{entry.queueNumber}
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <PriorityBadge priority={entry.priority} />
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <StatusBadge status={entry.status} />
              </td>
              <td className="px-5 py-4 text-base text-gray-600 whitespace-nowrap">
                {formatDate(entry.joinedAt)}
              </td>
              <td className="px-5 py-4 text-base text-gray-600 whitespace-nowrap">
                {formatDate(entry.calledAt)}
              </td>
              <td className="px-5 py-4 text-base font-medium text-gray-800 whitespace-nowrap">
                {formatAwt(entry.actualWaitingTime)}
              </td>
              <td className="px-5 py-4 text-base text-gray-600 whitespace-nowrap">
                {entry.status === "COMPLETED"
                  ? formatDate(entry.completedAt)
                  : entry.status === "NO_SHOW"
                  ? formatDate(entry.calledAt)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
