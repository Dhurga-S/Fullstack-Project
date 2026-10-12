import { useEffect, useState } from "react";
import { getQueues } from "../../services/queueService";
import type { Queue } from "../../types/queue";

interface Props {
  value: string;
  onChange: (queueId: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  activeOnly?: boolean;
}

export default function QueueSelector({
  value,
  onChange,
  disabled = false,
  label = "Select Queue",
  required = false,
  error,
  activeOnly = true,
}: Props) {
  const [queues, setQueues]       = useState<Queue[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await getQueues(activeOnly ? "ACTIVE" : undefined);
        if (!cancelled) setQueues(data);
      } catch {
        if (!cancelled) setFetchError("Unable to load queues. Please check the backend.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeOnly]);

  const selectDisabled = disabled || loading || !!fetchError;

  return (
    <div>
      {/* Label — text-base (16px) */}
      <label className="block text-base font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Loading */}
      {loading && (
        <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-base text-gray-400 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading queues…
        </div>
      )}

      {/* Fetch error */}
      {!loading && fetchError && (
        <div className="w-full px-4 py-3 rounded-lg border border-red-300 bg-red-50 text-base text-red-600">
          {fetchError}
        </div>
      )}

      {/* Dropdown */}
      {!loading && !fetchError && (
        queues.length === 0 ? (
          <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-base text-gray-400">
            No active queues available.
          </div>
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={selectDisabled}
            aria-required={required}
            className={`
              w-full px-4 py-3 rounded-lg border text-base text-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              bg-white
              ${error ? "border-red-400" : "border-gray-300"}
            `}
          >
            <option value="" disabled>— Choose a queue —</option>
            {queues.map((q) => (
              <option key={q._id} value={q._id}>
                {q.name}{q.averageConsultationTime ? ` (avg. ${q.averageConsultationTime} min)` : ""}
              </option>
            ))}
          </select>
        )
      )}

      {/* Validation error */}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
