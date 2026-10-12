import type { QueueEntryStatus } from "../../types/queue";

interface ActionDef {
  label: string;
  loadingLabel: string;
  targetStatus: QueueEntryStatus;
  variant: "primary" | "warning" | "danger" | "success";
}

const ACTIONS: Partial<Record<QueueEntryStatus, ActionDef[]>> = {
  WAITING: [
    { label: "Call Patient",  loadingLabel: "Calling…",    targetStatus: "CALLED",          variant: "primary" },
    { label: "Cancel",        loadingLabel: "Cancelling…", targetStatus: "CANCELLED",        variant: "danger"  },
  ],
  CALLED: [
    { label: "Start Consultation", loadingLabel: "Starting…",   targetStatus: "IN_CONSULTATION", variant: "success"  },
    { label: "No Show",            loadingLabel: "Marking…",     targetStatus: "NO_SHOW",         variant: "warning"  },
  ],
  IN_CONSULTATION: [
    { label: "Complete", loadingLabel: "Completing…", targetStatus: "COMPLETED", variant: "success" },
  ],
};

const variantClass: Record<ActionDef["variant"], string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
  success: "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50",
  danger:  "bg-red-500  text-white hover:bg-red-600  disabled:opacity-50",
};

interface Props {
  entryId: string;
  currentStatus: QueueEntryStatus;
  pendingStatus: QueueEntryStatus | null;
  onAction: (entryId: string, targetStatus: QueueEntryStatus) => void;
}

export default function QueueActionButtons({ entryId, currentStatus, pendingStatus, onAction }: Props) {
  const actions = ACTIONS[currentStatus];

  if (!actions || actions.length === 0) {
    return <span className="text-sm text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const isThisPending = pendingStatus === action.targetStatus;
        const anyPending   = pendingStatus !== null;

        return (
          <button
            key={action.targetStatus}
            onClick={() => onAction(entryId, action.targetStatus)}
            disabled={anyPending}
            className={`
              inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md
              text-sm font-semibold transition-colors
              cursor-pointer disabled:cursor-not-allowed
              ${variantClass[action.variant]}
            `}
          >
            {isThisPending ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {action.loadingLabel}
              </>
            ) : (
              action.label
            )}
          </button>
        );
      })}
    </div>
  );
}
