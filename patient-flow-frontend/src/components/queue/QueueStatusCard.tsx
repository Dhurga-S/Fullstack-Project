import PriorityBadge from "../dashboard/PriorityBadge";
import type { QueueEntry, QueueEntryStatus } from "../../types/queue";
import { Spinner } from "../../utils/ui";

interface Props {
  entry: QueueEntry;
  onRefresh: () => void;
  refreshing: boolean;
}

// ---------------------------------------------------------------------------
// Status config: banner colour + message + text badge (white-safe on banner)
// ---------------------------------------------------------------------------
const statusConfig: Record<
  QueueEntryStatus,
  { bannerCls: string; message: string; badgeLabel: string; badgeCls: string }
> = {
  WAITING: {
    bannerCls: "bg-blue-700",
    message: "Please wait — you will be called shortly.",
    badgeLabel: "Waiting",
    badgeCls: "bg-white/20 text-white border border-white/30",
  },
  CALLED: {
    bannerCls: "bg-amber-500",
    message: "Please proceed to the consultation area.",
    badgeLabel: "Called",
    badgeCls: "bg-white/20 text-white border border-white/30",
  },
  IN_CONSULTATION: {
    bannerCls: "bg-purple-700",
    message: "Consultation is in progress.",
    badgeLabel: "In Consultation",
    badgeCls: "bg-white/20 text-white border border-white/30",
  },
  COMPLETED: {
    bannerCls: "bg-green-700",
    message: "Consultation completed. Thank you.",
    badgeLabel: "Completed",
    badgeCls: "bg-white/20 text-white border border-white/30",
  },
  NO_SHOW: {
    bannerCls: "bg-gray-500",
    message: "Patient was marked as no-show.",
    badgeLabel: "No Show",
    badgeCls: "bg-white/20 text-white border border-white/30",
  },
  CANCELLED: {
    bannerCls: "bg-red-500",
    message: "Queue entry has been cancelled.",
    badgeLabel: "Cancelled",
    badgeCls: "bg-white/20 text-white border border-white/30",
  },
};

// ---------------------------------------------------------------------------
// Small helper: one info row — semantic dl/dt/dd pair
// ---------------------------------------------------------------------------
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-44 shrink-0">
        {label}
      </dt>
      <dd className="text-gray-800 text-sm font-medium">{value}</dd>
    </div>
  );
}

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function QueueStatusCard({ entry, onRefresh, refreshing }: Props) {
  const isWaiting = entry.status === "WAITING";
  const isCalled = entry.status === "CALLED";
  const cfg = statusConfig[entry.status] ?? statusConfig.WAITING;

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Coloured top banner */}
      <div className={`${cfg.bannerCls} px-6 py-5 text-white`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">
              Queue Status
            </p>
            {/* Use h3 for proper heading hierarchy */}
            <h3 className="text-xl font-bold leading-snug">
              {cfg.message}
            </h3>
          </div>
          {/* White-safe badge — avoids colored-badge-on-colored-banner contrast clash */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.badgeCls}`}
          >
            {cfg.badgeLabel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white p-6 space-y-6">

        {/* WAITING: position + EWT */}
        {isWaiting && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                Current Position
              </p>
              <p className="text-4xl font-extrabold text-blue-700 mt-1" aria-label={`Position ${entry.position}`}>
                #{entry.position}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                Est. Wait
              </p>
              <p
                className="text-4xl font-extrabold text-blue-700 mt-1"
                aria-label={`${entry.estimatedWaitingTime > 0 ? entry.estimatedWaitingTime : "less than 1"} minutes estimated wait`}
              >
                {entry.estimatedWaitingTime > 0 ? entry.estimatedWaitingTime : "< 1"}
              </p>
              <p className="text-xs text-blue-400 mt-0.5">minutes</p>
            </div>
          </div>
        )}

        {/* CALLED: call-to-action */}
        {isCalled && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl shrink-0" aria-hidden="true">📢</span>
            <p className="text-amber-800 font-semibold text-sm">
              Your turn! Please proceed to the consultation area.
            </p>
          </div>
        )}

        {/* Detail rows */}
        <dl className="space-y-3 divide-y divide-gray-100">
          <div className="space-y-3">
            <InfoRow label="Queue Number" value={`#${entry.queueNumber}`} />
            <InfoRow label="Priority" value={<PriorityBadge priority={entry.priority} />} />
            {!isWaiting && (
              <InfoRow
                label="Est. Wait"
                value={entry.estimatedWaitingTime > 0 ? `${entry.estimatedWaitingTime} min` : "< 1 min"}
              />
            )}
          </div>

          <div className="space-y-3 pt-3">
            <InfoRow label="Joined At" value={fmtDateTime(entry.joinedAt)} />
            {entry.calledAt && <InfoRow label="Called At" value={fmtDateTime(entry.calledAt)} />}
            {entry.consultationStartedAt && (
              <InfoRow label="Consultation Started" value={fmtDateTime(entry.consultationStartedAt)} />
            )}
            {entry.completedAt && <InfoRow label="Completed At" value={fmtDateTime(entry.completedAt)} />}
            {entry.actualWaitingTime > 0 && (
              <InfoRow label="Actual Wait" value={`${entry.actualWaitingTime} min`} />
            )}
          </div>

          <div className="pt-3">
            <InfoRow
              label="Queue Entry ID"
              value={<span className="font-mono text-xs text-gray-600 break-all">{entry._id}</span>}
            />
          </div>
        </dl>

        {/* Refresh */}
        <div className="pt-1">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh queue status"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {refreshing ? (
              <><Spinner size="sm" color="text-gray-500" /> Refreshing…</>
            ) : (
              <><span aria-hidden="true">🔄</span> Refresh Queue</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
