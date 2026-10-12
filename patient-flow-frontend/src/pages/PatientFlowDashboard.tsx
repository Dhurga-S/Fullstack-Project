import { useCallback, useState } from "react";
import SummaryCard from "../components/dashboard/SummaryCard";
import QueueTable from "../components/dashboard/QueueTable";
import QueueSelector from "../components/queue/QueueSelector";
import { getQueue, getQueueEntries } from "../services/queueService";
import type { Queue, QueueEntry } from "../types/queue";

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function PatientFlowDashboard() {
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [queueIdLoaded, setQueueIdLoaded] = useState("");

  const [queue, setQueue] = useState<Queue | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQueueData = useCallback(async (queueId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [queueData, entriesData] = await Promise.all([
        getQueue(queueId),
        getQueueEntries(queueId),
      ]);
      setQueue(queueData);
      setEntries(entriesData.entries);
      setCount(entriesData.count);
      setLastUpdated(new Date());
      setQueueIdLoaded(queueId);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setError("Queue not found.");
      } else {
        setError("Unable to load queue. Please make sure the backend is running.");
      }
      setQueue(null);
      setEntries([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoad = () => {
    if (!selectedQueueId) {
      setError("Please select a queue.");
      return;
    }
    fetchQueueData(selectedQueueId);
  };

  const handleRefresh = () => fetchQueueData(queueIdLoaded);

  const summaryCards = [
    { label: "Patients Waiting", value: queueIdLoaded ? count : "—", valueColor: "text-blue-700", icon: "🪑" },
    { label: "Patients Called", value: "N/A", valueColor: "text-yellow-600", icon: "📢" },
    { label: "In Consultation", value: "N/A", valueColor: "text-purple-700", icon: "🩺" },
    { label: "Completed", value: "N/A", valueColor: "text-green-700", icon: "✅" },
  ];

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Patient Flow Dashboard</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Monitor patient queues, waiting times and patient flow.
        </p>
      </div>

      {/* Queue Selector */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Load Queue
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <QueueSelector
              value={selectedQueueId}
              onChange={(id) => {
                setSelectedQueueId(id);
                setError(null);
              }}
              disabled={loading}
              label="Queue"
              required
            />
          </div>
          <button
            onClick={handleLoad}
            disabled={loading || !selectedQueueId}
            className="px-5 py-2.5 rounded-lg bg-blue-700 text-white text-base font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? "Loading…" : "Load Queue"}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            <span className="mt-0.5" aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Queue info banner */}
      {queue && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Active Queue</span>
            <p className="font-semibold text-blue-800 text-lg leading-tight">{queue.name}</p>
            <p className="text-blue-500 text-xs mt-0.5">
              Avg. consultation time: {queue.averageConsultationTime} min
            </p>
          </div>
          <span className={`self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${queue.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {queue.status}
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} label={card.label} value={card.value} valueColor={card.valueColor} icon={card.icon} />
        ))}
      </div>

      {/* Current Queue Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">Current Queue</h3>
            {queueIdLoaded && !loading && (
              <p className="text-xs text-gray-400 mt-0.5">Showing WAITING entries in priority order</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <p className="text-xs text-gray-400">
                Last updated: <span className="font-medium text-gray-500">{formatTime(lastUpdated)}</span>
              </p>
            )}
            {queueIdLoaded && (
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span aria-hidden="true">🔄</span>
                Refresh Queue
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm">Loading queue…</span>
            </div>
          )}

          {!loading && !queueIdLoaded && !error && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 font-medium">No queue loaded</p>
              <p className="text-sm mt-1">Select a queue above and click Load Queue to view entries.</p>
            </div>
          )}

          {!loading && queueIdLoaded && <QueueTable entries={entries} />}
        </div>
      </div>
    </div>
  );
}
