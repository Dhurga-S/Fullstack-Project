import type { QueueEntry } from "../../types/queue";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

interface Props {
  entries: QueueEntry[];
}

export default function QueueTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-14 text-gray-400">
        <div className="text-5xl mb-3">🪑</div>
        <p className="text-base font-medium text-gray-500">
          No patients are currently waiting.
        </p>
        <p className="text-sm mt-1">
          The queue is empty or all patients have been processed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Position", "Queue No.", "Priority", "Status", "Est. Wait"].map((col) => (
              <th
                key={col}
                scope="col"
                className="px-5 py-3.5 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {entries.map((entry, index) => (
            <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4 text-base font-semibold text-gray-700 whitespace-nowrap">
                {index + 1}
              </td>
              <td className="px-5 py-4 text-base text-gray-800 whitespace-nowrap">
                #{entry.queueNumber}
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <PriorityBadge priority={entry.priority} />
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <StatusBadge status={entry.status} />
              </td>
              <td className="px-5 py-4 text-base text-gray-700 whitespace-nowrap">
                {entry.estimatedWaitingTime > 0
                  ? `${entry.estimatedWaitingTime} min`
                  : "< 1 min"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
