import { useCallback, useState } from "react";
import QueueAnalyticsCards from "../components/queue/QueueAnalyticsCards";
import QueueHistoryTable from "../components/queue/QueueHistoryTable";
import QueueSelector from "../components/queue/QueueSelector";
import { getQueueEntries } from "../services/queueService";
import type { QueueEntry } from "../types/queue";

export default function QueueHistoryPage() {
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [loadedQueueId, setLoadedQueueId] = useState("");
  const [selectorError, setSelectorError] = useState<string | undefined>();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadHistory = useCallback(async (queueId: string) => {
    const id = queueId.trim();
    if (!id) {
      setSelectorError("Please select a queue.");
      return;
    }

    setLoading(true);
    setLoadError(null);
    setSelectorError(undefined);

    try {
      const { entries: fetchedEntries } = await getQueueEntries(id, true);
      setEntries(fetchedEntries);
      setLoadedQueueId(id);
    } catch {
      setEntries([]);
      setLoadError("Unable to load queue history.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoad = () => loadHistory(selectedQueueId);
  const handleRefresh = () => loadHistory(loadedQueueId);

  // Filter historical statuses for history list view: COMPLETED, NO_SHOW, CANCELLED
  const historyEntries = entries.filter((e) =>
    ["COMPLETED", "NO_SHOW", "CANCELLED"].includes(e.status)
  );

  return (
    <div className="space-y-7">
      {/* Page Heading */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Queue History</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Review completed patient flow and waiting-time information.
        </p>
      </div>

      {/* Queue Selector Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Select Queue
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
              disabled={loading}
              label="Select Queue"
              required
              error={selectorError}
              activeOnly={false}
            />
          </div>
          <button
            onClick={handleLoad}
            disabled={loading || !selectedQueueId}
            className="px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? "Loading queue history..." : "Load History"}
          </button>
        </div>

        {loadError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            <span aria-hidden="true">⚠️</span>
            <span>{loadError}</span>
          </div>
        )}
      </div>

      {/* Analytics Summary Cards */}
      {loadedQueueId && !loading && !loadError && (
        <QueueAnalyticsCards entries={entries} />
      )}

      {/* History Table Container */}
      {loadedQueueId && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-800">Historical Records</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Displaying completed, no-show, and cancelled queue entries.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span aria-hidden="true">🔄</span>
              {loading ? "Loading..." : "Refresh History"}
            </button>
          </div>

          {/* Content / Loading / Table */}
          {loading ? (
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
              <span className="text-sm">Loading queue history...</span>
            </div>
          ) : (
            <div className="p-6">
              <QueueHistoryTable entries={historyEntries} />
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!loadedQueueId && !loadError && !loading && (
        <div className="text-center py-14 text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500 font-medium">No queue selected</p>
          <p className="text-sm mt-1">
            Choose a queue above and click Load History to view queue entries and analytics.
          </p>
        </div>
      )}
    </div>
  );
}
