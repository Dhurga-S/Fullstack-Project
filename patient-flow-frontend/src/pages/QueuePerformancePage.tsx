import { useCallback, useState } from "react";
import SummaryCard from "../components/dashboard/SummaryCard";
import PriorityDistribution from "../components/queue/PriorityDistribution";
import QueueSelector from "../components/queue/QueueSelector";
import RecentCompletedTable from "../components/queue/RecentCompletedTable";
import StatusDistribution from "../components/queue/StatusDistribution";
import WaitingTimePerformance from "../components/queue/WaitingTimePerformance";
import { getQueueEntries } from "../services/queueService";
import type { QueueEntry } from "../types/queue";

export default function QueuePerformancePage() {
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [loadedQueueId, setLoadedQueueId] = useState("");
  const [selectorError, setSelectorError] = useState<string | undefined>();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPerformance = useCallback(async (queueId: string) => {
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
      setLoadError("Unable to load queue performance data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoad = () => loadPerformance(selectedQueueId);
  const handleRefresh = () => loadPerformance(loadedQueueId);

  // Compute Summary Metrics
  const totalPatients = entries.length;
  const waitingCount = entries.filter((e) => e.status === "WAITING").length;
  const completedCount = entries.filter((e) => e.status === "COMPLETED").length;
  const noShowCount = entries.filter((e) => e.status === "NO_SHOW").length;
  const cancelledCount = entries.filter((e) => e.status === "CANCELLED").length;

  // Actual waiting time is only meaningful for patients who were called (WAITING→CALLED
  // transition sets actualWaitingTime). WAITING entries always have actualWaitingTime=0
  // (never called yet), so exclude them to prevent skewing the averages.
  const validAwtEntries = entries.filter(
    (e) =>
      e.status !== "WAITING" &&
      e.status !== "IN_CONSULTATION" &&
      typeof e.actualWaitingTime === "number" &&
      !isNaN(e.actualWaitingTime) &&
      e.actualWaitingTime >= 0
  );

  let avgAwtDisplay = "—";
  let maxAwtDisplay = "—";

  if (validAwtEntries.length > 0) {
    const times = validAwtEntries.map((e) => e.actualWaitingTime);
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / validAwtEntries.length);
    const max = Math.max(...times);
    avgAwtDisplay = `${avg} min`;
    maxAwtDisplay = `${max} min`;
  }

  return (
    <div className="space-y-7">
      {/* Page Heading */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Queue Performance Dashboard</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Visual overview of queue efficiency, priority distribution, and waiting-time metrics.
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
            {loading ? "Loading performance data..." : "Load Performance"}
          </button>
        </div>

        {loadError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            <span aria-hidden="true">⚠️</span>
            <span>{loadError}</span>
          </div>
        )}
      </div>

      {/* Main Dashboard Content */}
      {loadedQueueId && !loading && !loadError && (
        <>
          {totalPatients === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 font-medium text-base">
                No queue data available yet.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Patients added to this queue will appear here once registered.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              {/* Header with Refresh Controls */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Performance Summary
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <span aria-hidden="true">🔄</span>
                  {loading ? "Loading..." : "Refresh Performance"}
                </button>
              </div>

              {/* 7 Summary Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <SummaryCard
                  label="Total Patients"
                  value={totalPatients}
                  valueColor="text-gray-800"
                  icon="👥"
                />
                <SummaryCard
                  label="Waiting"
                  value={waitingCount}
                  valueColor="text-blue-700"
                  icon="🪑"
                />
                <SummaryCard
                  label="Completed"
                  value={completedCount}
                  valueColor="text-green-700"
                  icon="✅"
                />
                <SummaryCard
                  label="No Show"
                  value={noShowCount}
                  valueColor="text-gray-600"
                  icon="👤"
                />
                <SummaryCard
                  label="Cancelled"
                  value={cancelledCount}
                  valueColor="text-red-600"
                  icon="🚫"
                />
                <SummaryCard
                  label="Average Waiting Time"
                  value={avgAwtDisplay}
                  valueColor="text-blue-700"
                  icon="⏱️"
                />
                <SummaryCard
                  label="Longest Waiting Time"
                  value={maxAwtDisplay}
                  valueColor="text-rose-700"
                  icon="⏳"
                />
              </div>

              {/* Distribution Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PriorityDistribution entries={entries} />
                <StatusDistribution entries={entries} />
              </div>

              {/* Waiting Time Range Performance */}
              <WaitingTimePerformance entries={entries} />

              {/* Recent Completed Table */}
              <RecentCompletedTable entries={entries} />
            </div>
          )}
        </>
      )}

      {/* Loading state banner */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          <svg
            className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-3"
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
          <span className="text-sm font-medium">Loading performance data...</span>
        </div>
      )}

      {/* Initial state */}
      {!loadedQueueId && !loadError && !loading && (
        <div className="text-center py-14 text-gray-400">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-gray-500 font-medium">No queue selected</p>
          <p className="text-sm mt-1">
            Choose a queue above and click Load Performance to generate the efficiency dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
