import { useCallback, useState } from "react";
import OptimizationSummary from "../components/optimization/OptimizationSummary";
import RecommendationCard from "../components/optimization/RecommendationCard";
import QueueSelector from "../components/queue/QueueSelector";
import { analyzeQueueFlow, type QueueOptimizationData } from "../services/optimizationService";
import type { Queue, QueueEntry } from "../types/queue";
import type { OptimizationAnalysisResult } from "../types/optimization";

function formatTimestamp(d: Date): string {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function PatientFlowOptimizationPage() {
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [selectorError, setSelectorError] = useState<string | undefined>();

  // Loaded analysis state
  const [loadedQueueId, setLoadedQueueId] = useState("");
  const [queue, setQueue] = useState<Queue | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [analysis, setAnalysis] = useState<OptimizationAnalysisResult | null>(null);

  // Status flags
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch queue data and evaluate optimization recommendations
  // -------------------------------------------------------------------------
  const performAnalysis = useCallback(async (queueId: string) => {
    const trimmedId = queueId.trim();
    if (!trimmedId) {
      setSelectorError("Please select a queue to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectorError(undefined);

    try {
      const data: QueueOptimizationData = await analyzeQueueFlow(trimmedId);
      setQueue(data.queue);
      setEntries(data.entries);
      setAnalysis(data.analysis);
      setLoadedQueueId(trimmedId);
    } catch {
      setError(
        "Unable to load queue data for analysis. Please verify that the backend service is running and accessible."
      );
      setQueue(null);
      setEntries([]);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnalyze = () => performAnalysis(selectedQueueId);
  const handleRefresh = () => {
    if (loadedQueueId) {
      performAnalysis(loadedQueueId);
    }
  };

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Patient Flow Optimization
            </h2>
            <p className="mt-1.5 text-base text-gray-500">
              Identify queue bottlenecks and review operational recommendations based on current queue data.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            📊 Rule-Based Operational Guidance
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Clinical & Operational Safety Notice                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
        <span className="text-base select-none mt-0.5" aria-hidden="true">
          🛡️
        </span>
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-950">
            Clinical Safety &amp; Operational Governance
          </p>
          <p className="text-amber-800 leading-relaxed">
            Recommendations are generated using transparent, rule-based operational criteria from actual backend queue entries.
            They are not produced by AI/ML algorithms and are not clinically validated diagnostic conclusions.
            Hospital clinical and administrative staff must make all final triage, prioritization, and resource allocation decisions.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1 & 2: Queue Selector + Analyze Queue Button                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Select Queue for Analysis
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <QueueSelector
              value={selectedQueueId}
              onChange={(id) => {
                setSelectedQueueId(id);
                setSelectorError(undefined);
                setError(null);
              }}
              disabled={loading}
              label="Active Queue"
              required
              error={selectorError}
              activeOnly={false}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !selectedQueueId}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shadow-sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                <span>Analyzing Queue…</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">🔍</span>
                <span>Analyze Queue</span>
              </>
            )}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading state indicator                                             */}
      {/* ------------------------------------------------------------------ */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          <svg
            className="animate-spin h-7 w-7 text-blue-600 mx-auto mb-3"
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
          <p className="text-base font-medium text-gray-700">
            Analyzing queue entries and evaluating operational rules…
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Retrieving real-time queue data from backend API
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Main Analysis Results                                               */}
      {/* ------------------------------------------------------------------ */}
      {loadedQueueId && !loading && analysis && (
        <div className="space-y-8">
          {/* Analysis Header Toolbar with 6. Timestamp and 7. Refresh Button */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Analyzed Queue
                </span>
                {queue?.status && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      queue.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {queue.status}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mt-0.5">
                {queue?.name || "Queue"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {queue?.averageConsultationTime
                  ? `Average consultation time: ${queue.averageConsultationTime} minutes · `
                  : ""}
                {entries.length} {entries.length === 1 ? "entry" : "entries"} evaluated from backend
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:self-auto self-start">
              {/* 6. Last analyzed timestamp */}
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-400">Last analyzed at</p>
                <p className="text-sm font-semibold text-gray-700">
                  {formatTimestamp(analysis.analyzedAt)}
                </p>
              </div>

              {/* 7. Refresh Analysis button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs"
              >
                <span aria-hidden="true">🔄</span>
                <span>Refresh Analysis</span>
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 3. Summary Metric Cards                                          */}
          {/* ---------------------------------------------------------------- */}
          <OptimizationSummary metrics={analysis.metrics} />

          {/* ---------------------------------------------------------------- */}
          {/* 4. High-Importance Alerts                                        */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span>🚨 High-Importance Alerts</span>
                <span className="text-xs font-normal text-gray-500">
                  ({analysis.highImportanceAlerts.length})
                </span>
              </h3>
            </div>

            {analysis.highImportanceAlerts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {analysis.highImportanceAlerts.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-5 text-sm text-gray-600 flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  ✅
                </span>
                <div>
                  <p className="font-semibold text-gray-800">
                    No High-Importance Emergency Alerts
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    No waiting patients currently match high-priority emergency alert criteria.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 5. Other Recommendations                                         */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span>💡 Operational Recommendations &amp; Guidance</span>
                <span className="text-xs font-normal text-gray-500">
                  ({analysis.otherRecommendations.length})
                </span>
              </h3>
            </div>

            {analysis.otherRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.otherRecommendations.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-5 text-sm text-gray-500">
                No additional operational recommendations triggered for this queue state.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Initial Empty / Prompt State                                        */}
      {/* ------------------------------------------------------------------ */}
      {!loadedQueueId && !loading && !error && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
          <div className="text-5xl mb-3">🧭</div>
          <h3 className="text-lg font-semibold text-gray-700">
            No Queue Analyzed Yet
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Select a hospital queue from the dropdown above and click{" "}
            <span className="font-semibold text-blue-700">Analyze Queue</span> to
            evaluate current waiting counts, emergency statuses, delays, and operational suggestions.
          </p>
        </div>
      )}
    </div>
  );
}
