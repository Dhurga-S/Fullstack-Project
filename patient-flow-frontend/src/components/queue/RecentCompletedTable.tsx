import PriorityBadge from "../dashboard/PriorityBadge";
import type { QueueEntry } from "../../types/queue";

interface Props {
  entries: QueueEntry[];
}

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatAwt(awt?: number): string {
  if (typeof awt !== "number" || isNaN(awt) || awt < 0) {
    return "—";
  }
  return `${awt} min`;
}

export default function RecentCompletedTable({ entries }: Props) {
  const completedEntries = entries
    .filter((e) => e.status === "COMPLETED")
    .sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeB - timeA;
    });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-base font-semibold text-gray-800">
          Recent Completed Patients
        </h3>
        <span className="text-xs text-gray-500">
          {completedEntries.length} total completed
        </span>
      </div>

      {completedEntries.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          No completed patients yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Queue Number
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Priority
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Actual Waiting Time
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Completed At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {completedEntries.slice(0, 10).map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                    #{entry.queueNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PriorityBadge priority={entry.priority} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">
                    {formatAwt(entry.actualWaitingTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatDate(entry.completedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
