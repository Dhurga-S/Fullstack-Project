import { useCallback, useState } from "react";
import QueueStatusCard from "../components/queue/QueueStatusCard";
import QueueSelector from "../components/queue/QueueSelector";
import { trackQueueEntry } from "../services/queueService";
import type { QueueEntry } from "../types/queue";

// ---------------------------------------------------------------------------
// Validation — only entryId needs manual ObjectId check now; queueId comes from selector
// ---------------------------------------------------------------------------
const isValidObjectId = (v: string) => /^[a-f\d]{24}$/i.test(v.trim());

interface FieldErrors {
  queueId?: string;
  queueEntryId?: string;
}

function validate(queueId: string, queueEntryId: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!queueId) {
    errors.queueId = "Please select a queue.";
  }
  if (!queueEntryId.trim()) {
    errors.queueEntryId = "Queue Entry ID is required.";
  } else if (!isValidObjectId(queueEntryId)) {
    errors.queueEntryId =
      "Queue Entry ID must be a valid 24-character MongoDB ObjectId.";
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Error message resolver
// ---------------------------------------------------------------------------
function resolveError(err: unknown): string {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };

  const status = axiosErr?.response?.status;
  const serverMsg = axiosErr?.response?.data?.message;

  switch (status) {
    case 400:
      // Backend says "Patient is not currently waiting in the queue"
      // Surface the exact message — it contains the actionable reason.
      return serverMsg ?? "Invalid request. Please check the IDs entered.";
    case 404:
      return (
        serverMsg ??
        "Queue entry not found. Please check the Queue ID and Queue Entry ID."
      );
    case 500:
      return "Server error. Please try again or contact support.";
    default:
      return (
        serverMsg ??
        axiosErr?.message ??
        "Unable to load queue status. Please make sure the backend is running."
      );
  }
}

// ---------------------------------------------------------------------------
// Shared input classes
// ---------------------------------------------------------------------------
const inputBase =
  "w-full px-4 py-3 rounded-lg border text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-base font-medium text-gray-700 mb-1.5";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function QueueStatusPage() {
  const [queueId, setQueueId] = useState("");
  const [queueEntryId, setQueueEntryId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [loading, setLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [entry, setEntry] = useState<QueueEntry | null>(null);

  // Stored so Refresh can re-use the same IDs
  const [trackedQueueId, setTrackedQueueId] = useState("");
  const [trackedEntryId, setTrackedEntryId] = useState("");

  // -------------------------------------------------------------------------
  // Core fetch
  // -------------------------------------------------------------------------
  const fetchEntry = useCallback(
    async (qId: string, eId: string) => {
      setLoading(true);
      setTrackError(null);
      try {
        const result = await trackQueueEntry(qId, eId);
        setEntry(result);
        setTrackedQueueId(qId);
        setTrackedEntryId(eId);
      } catch (err) {
        setTrackError(resolveError(err));
        setEntry(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(queueId, queueEntryId);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    await fetchEntry(queueId.trim(), queueEntryId.trim());
  };

  const handleRefresh = () => fetchEntry(trackedQueueId, trackedEntryId);

  const handleFieldChange =
    (setter: React.Dispatch<React.SetStateAction<string>>, field: keyof FieldErrors) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const borderColor = (field: keyof FieldErrors) =>
    fieldErrors[field] ? "border-red-400" : "border-gray-300";

  const errorText = (msg?: string) =>
    msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto">
      {/* Page heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Queue Status</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Track a patient's current position and waiting status in the queue.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search form                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Enter Queue Details
        </h3>

        <form onSubmit={handleTrack} noValidate className="space-y-4">
          {/* Queue selector */}
          <QueueSelector
            value={queueId}
            onChange={(id) => {
              handleFieldChange(setQueueId, "queueId")({
                target: { value: id },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            disabled={loading}
            label="Queue"
            required
            error={fieldErrors.queueId}
            activeOnly={false}
          />

          {/* Queue Entry ID */}
          <div>
            <label htmlFor="qs-entryId" className={labelClass}>
              Queue Entry ID <span className="text-red-500">*</span>
            </label>
            <input
              id="qs-entryId"
              type="text"
              placeholder="24-character MongoDB ObjectId"
              value={queueEntryId}
              onChange={handleFieldChange(setQueueEntryId, "queueEntryId")}
              disabled={loading}
              aria-describedby="qs-entryId-hint"
              className={`${inputBase} ${borderColor("queueEntryId")}`}
            />
            <p id="qs-entryId-hint" className="mt-1 text-sm text-gray-400">
              The Queue Entry ID is generated when the patient joins a queue
              (see the Join Queue page).
            </p>
            {errorText(fieldErrors.queueEntryId)}
          </div>

          {/* Submit */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-700 text-white text-base font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Loading…
                </>
              ) : (
                "Track Queue"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error banner                                                         */}
      {/* ------------------------------------------------------------------ */}
      {trackError && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
          <span className="text-red-500 text-xl mt-0.5" aria-hidden="true">
            ⚠️
          </span>
          <div>
            <p className="text-red-700 text-sm font-medium">
              Unable to load queue status
            </p>
            <p className="text-red-600 text-sm mt-0.5">{trackError}</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Queue status card                                                    */}
      {/* ------------------------------------------------------------------ */}
      {entry && (
        <QueueStatusCard
          entry={entry}
          onRefresh={handleRefresh}
          refreshing={loading}
        />
      )}

      {/* Initial empty state */}
      {!entry && !trackError && !loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">No queue entry loaded</p>
          <p className="text-sm mt-1">
            Enter a Queue ID and Queue Entry ID above to track a patient.
          </p>
        </div>
      )}
    </div>
  );
}
