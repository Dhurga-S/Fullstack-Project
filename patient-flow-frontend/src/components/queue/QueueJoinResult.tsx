import PriorityBadge from "../dashboard/PriorityBadge";
import StatusBadge from "../dashboard/StatusBadge";
import type { QueueEntry } from "../../types/queue";

interface Props {
  entry: QueueEntry;
  onReset: () => void;
}

/**
 * Displays the result of a successful queue join.
 * All values come directly from the backend response — nothing is calculated here.
 */
export default function QueueJoinResult({ entry, onReset }: Props) {
  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-6 space-y-5">
      {/* Title row */}
      <div className="flex items-start gap-3">
        <span className="text-green-500 text-2xl mt-0.5" aria-hidden="true">
          ✅
        </span>
        <div>
          <h3 className="text-lg font-semibold text-green-800">
            Queue Joined Successfully
          </h3>
          <p className="text-green-600 text-sm mt-0.5">
            Patient has been added to the queue.
          </p>
        </div>
      </div>

      {/* Result grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultRow label="Queue Number" value={`#${entry.queueNumber}`} mono />
        <ResultRow
          label="Priority"
          value={<PriorityBadge priority={entry.priority} />}
        />
        <ResultRow label="Status" value={<StatusBadge status={entry.status} />} />
        <ResultRow
          label="Estimated Wait"
          value={
            entry.estimatedWaitingTime > 0
              ? `${entry.estimatedWaitingTime} minutes`
              : "< 1 minute"
          }
        />
        <ResultRow
          label="Queue Entry ID"
          value={entry._id}
          mono
          colSpan
        />
      </div>

      {/* Reset action */}
      <div className="pt-2">
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-lg border border-green-400 text-green-800 text-sm font-medium hover:bg-green-100 transition-colors"
        >
          Join Another Patient
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper: one result row
// ---------------------------------------------------------------------------
interface RowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  colSpan?: boolean;
}

function ResultRow({ label, value, mono, colSpan }: RowProps) {
  return (
    <div className={colSpan ? "sm:col-span-2" : undefined}>
      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p
        className={`text-gray-800 text-sm break-all ${
          mono ? "font-mono" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
