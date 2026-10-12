import { useCallback, useState } from "react";
import SummaryCard from "../components/dashboard/SummaryCard";
import QueueManagementTable from "../components/queue/QueueManagementTable";
import QueueSelector from "../components/queue/QueueSelector";
import {
  getQueue,
  getQueueEntries,
  updateQueueEntryStatus,
} from "../services/queueService";
import type { Queue, QueueEntry, QueueEntryStatus } from "../types/queue";

// ---------------------------------------------------------------------------
// Success messages per target status
// ---------------------------------------------------------------------------
const successMessages: Record<QueueEntryStatus, string> = {
  CALLED: "Patient successfully called.",
  IN_CONSULTATION: "Consultation started.",
  COMPLETED: "Consultation completed.",
  NO_SHOW: "Patient marked as no-show.",
  CANCELLED: "Queue entry cancelled.",
  WAITING: "",
};

// ---------------------------------------------------------------------------
// Error resolver
// ---------------------------------------------------------------------------
function resolveError(err: unknown): string {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
  };
  const status = axiosErr?.response?.status;
  const serverMsg = axiosErr?.response?.data?.message;

  switch (status) {
    case 400:
      return serverMsg ?? "Invalid status transition. Please check current entry status.";
    case 404:
      return serverMsg ?? "Queue entry not found.";
    case 500:
      return "Server error. Please try again.";
    default:
      return serverMsg ?? "Unable to connect to the backend. Please make sure it is running.";
  }
}

// ---------------------------------------------------------------------------
// PendingMap: tracks which target status is being submitted per entry
// ---------------------------------------------------------------------------
type PendingMap = Record<string, QueueEntryStatus | null>;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function QueueManagementPage() {
  // Queue selector state
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [selectorError, setSelectorError] = useState<string | undefined>();
  const [loadedQueueId, setLoadedQueueId] = useState("");
  const [queue, setQueue] = useState<Queue | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Action state
  const [pendingMap, setPendingMap] = useState<PendingMap>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Load queue + WAITING entries
  // -------------------------------------------------------------------------
  const loadQueue = useCallback(async (queueId: string) => {
    const id = queueId.trim();
    if (!id) {
      setSelectorError("Please select a queue.");
      return;
    }

    setLoadingQueue(true);
    setLoadError(null);
    setSelectorError(undefined);
    setActionError(null);
    setActionSuccess(null);

    try {
      const [queueData, { entries: waitingEntries }] = await Promise.all([
        getQueue(id),
        getQueueEntries(id),
      ]);
      setQueue(queueData);
      setEntries(waitingEntries);
      setLoadedQueueId(id);
    } catch (err) {
      setQueue(null);
      setEntries([]);
      setLoadError(resolveError(err));
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  const handleLoad = () => loadQueue(selectedQueueId);
  const handleRefresh = () => loadQueue(loadedQueueId);

  // -------------------------------------------------------------------------
  // Handle status action
  // Strategy:
  //   1. Optimistically mark the button as pending.
  //   2. Call PATCH endpoint — backend validates + sets timestamps.
  //   3. On success: replace the entry in local state with the updated entry
  //      returned by the backend. Refresh WAITING list to get updated EWTs.
  //   4. On error: show error message, clear pending state.
  // -------------------------------------------------------------------------
  const handleAction = useCallback(
    async (entryId: string, targetStatus: QueueEntryStatus) => {
      setActionError(null);
      setActionSuccess(null);
      setPendingMap((prev) => ({ ...prev, [entryId]: targetStatus }));

      try {
        // Backend validates transition, sets timestamps, returns updated entry
        const updatedEntry = await updateQueueEntryStatus(entryId, {
          status: targetStatus,
        });

        // Replace the entry in local state with the backend-returned version
        setEntries((prev) =>
          prev.map((e) => (e._id === entryId ? updatedEntry : e))
        );

        // Re-fetch WAITING entries to get fresh positions + EWTs for remaining
        // patients (backend recomputes these when a patient is moved out of WAITING)
        if (loadedQueueId) {
          try {
            const { entries: refreshed } = await getQueueEntries(loadedQueueId);
            // Merge: keep non-WAITING entries (which are no longer in the list)
            // and update/replace WAITING ones with fresh backend data
            setEntries((prev) => {
              const nonWaiting = prev.filter((e) => e.status !== "WAITING");
              return [...refreshed, ...nonWaiting];
            });
          } catch {
            // Silent — the UI already shows the updated status from step above
          }
        }

        setActionSuccess(successMessages[targetStatus] || "Status updated.");
      } catch (err) {
        setActionError(resolveError(err));
      } finally {
        setPendingMap((prev) => ({ ...prev, [entryId]: null }));
      }
    },
    [loadedQueueId]
  );

  // -------------------------------------------------------------------------
  // Summary counts — computed from local entries (display-only, no new API)
  // -------------------------------------------------------------------------
  const counts = entries.reduce(
    (acc, e) => {
      if (e.status === "WAITING") acc.waiting++;
      else if (e.status === "CALLED") acc.called++;
      else if (e.status === "IN_CONSULTATION") acc.inConsultation++;
      else if (e.status === "COMPLETED") acc.completed++;
      return acc;
    },
    { waiting: 0, called: 0, inConsultation: 0, completed: 0 }
  );

  const anyActionPending = Object.values(pendingMap).some((v) => v != null);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Queue Management</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Manage patients currently waiting for consultation. Move patients
          through the queue workflow.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Queue selector                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Load Queue
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <QueueSelector
              value={selectedQueueId}
              onChange={(id) => {
                setSelectedQueueId(id);
                setSelectorError(undefined);
                setLoadError(null);
              }}
              disabled={loadingQueue}
              label="Queue"
              required
              error={selectorError}
            />
          </div>
          <button
            onClick={handleLoad}
            disabled={loadingQueue || !selectedQueueId}
            className="px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loadingQueue ? "Loading…" : "Load Queue"}
          </button>
        </div>

        {loadError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            <span aria-hidden="true">⚠️</span>
            <span>{loadError}</span>
          </div>
        )}
      </div>

      {/* Queue banner */}
      {queue && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
              Loaded Queue
            </p>
            <p className="font-semibold text-blue-800 text-lg leading-tight">
              {queue.name}
            </p>
            <p className="text-blue-400 text-xs mt-0.5">
              Avg. consultation: {queue.averageConsultationTime} min
            </p>
          </div>
          <span
            className={`self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              queue.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {queue.status}
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Summary cards — computed from loaded entries, display-only          */}
      {/* ------------------------------------------------------------------ */}
      {loadedQueueId && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Waiting"
            value={counts.waiting}
            valueColor="text-blue-700"
            icon="🪑"
          />
          <SummaryCard
            label="Called"
            value={counts.called}
            valueColor="text-yellow-600"
            icon="📢"
          />
          <SummaryCard
            label="In Consultation"
            value={counts.inConsultation}
            valueColor="text-purple-700"
            icon="🩺"
          />
          <SummaryCard
            label="Completed"
            value={counts.completed}
            valueColor="text-green-700"
            icon="✅"
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Action feedback banners                                              */}
      {/* ------------------------------------------------------------------ */}
      {actionSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-lg px-4 py-3">
          <span className="text-green-500" aria-hidden="true">✅</span>
          <p className="text-green-700 text-sm font-medium">{actionSuccess}</p>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-lg px-4 py-3">
          <span className="text-red-500" aria-hidden="true">⚠️</span>
          <p className="text-red-700 text-sm">{actionError}</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Queue table                                                          */}
      {/* ------------------------------------------------------------------ */}
      {loadedQueueId && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-800">Current Queue</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                WAITING entries are shown in priority order. Other statuses are
                shown as updated.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loadingQueue || anyActionPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span aria-hidden="true">🔄</span>
              Refresh Queue
            </button>
          </div>

          {/* Loading state */}
          {loadingQueue ? (
            <div className="flex items-center justify-center gap-3 py-14 text-gray-500">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-sm">Loading queue…</span>
            </div>
          ) : (
            <div className="p-6">
              <QueueManagementTable
                entries={entries}
                pendingMap={pendingMap}
                onAction={handleAction}
              />
            </div>
          )}
        </div>
      )}

      {/* Initial prompt */}
      {!loadedQueueId && !loadError && !loadingQueue && (
        <div className="text-center py-14 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No queue loaded</p>
          <p className="text-sm mt-1">
            Enter a Queue ID above and click Load Queue to begin.
          </p>
        </div>
      )}
    </div>
  );
}
