import { useState } from "react";
import { joinQueue } from "../../services/queueService";
import type { QueueEntry } from "../../types/queue";
import QueueJoinResult from "./QueueJoinResult";
import QueueSelector from "./QueueSelector";

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------
const isValidObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value.trim());

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------
interface FormFields {
  patientId: string;
  triageId: string;
  queueId: string;
}

const EMPTY_FORM: FormFields = {
  patientId: "",
  triageId: "",
  queueId: "",
};

interface FieldErrors {
  patientId?: string;
  triageId?: string;
  queueId?: string;
}

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.patientId.trim()) {
    errors.patientId = "Patient ID is required.";
  } else if (!isValidObjectId(fields.patientId)) {
    errors.patientId =
      "Patient ID must be a valid 24-character MongoDB ObjectId.";
  }

  if (!fields.triageId.trim()) {
    errors.triageId = "Triage ID is required.";
  } else if (!isValidObjectId(fields.triageId)) {
    errors.triageId =
      "Triage ID must be a valid 24-character MongoDB ObjectId.";
  }

  if (!fields.queueId.trim()) {
    errors.queueId = "Please select a queue.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Map HTTP status codes to friendly messages
// ---------------------------------------------------------------------------
function resolveErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
  };

  const status = axiosErr?.response?.status;
  const serverMsg = axiosErr?.response?.data?.message;

  switch (status) {
    case 400:
      return serverMsg ?? "Invalid request. Please check the IDs you entered.";
    case 404:
      return (
        serverMsg ??
        "Resource not found. Make sure the Patient ID, Triage ID, and Queue ID all exist."
      );
    case 409:
      return (
        serverMsg ??
        "This patient is already active in this queue (WAITING, CALLED, or IN_CONSULTATION)."
      );
    case 500:
      return "Server error. Please try again or contact support.";
    default:
      return (
        serverMsg ??
        "Unable to join the queue. Please make sure the backend is running."
      );
  }
}

// ---------------------------------------------------------------------------
// Shared Tailwind classes
// ---------------------------------------------------------------------------
const inputBase =
  "w-full px-4 py-3 rounded-lg border text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-base font-medium text-gray-700 mb-1.5";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function JoinQueueForm() {
  const [fields, setFields] = useState<FormFields>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<QueueEntry | null>(null);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleChange =
    (field: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const entry = await joinQueue({
        patientId: fields.patientId.trim(),
        triageId: fields.triageId.trim(),
        queueId: fields.queueId.trim(),
      });
      setResult(entry);
    } catch (err) {
      setSubmitError(resolveErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFields(EMPTY_FORM);
    setFieldErrors({});
    setSubmitError(null);
    setResult(null);
  };

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const borderColor = (field: keyof FieldErrors) =>
    fieldErrors[field] ? "border-red-400" : "border-gray-300";

  const errorText = (msg?: string) =>
    msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null;

  // -------------------------------------------------------------------------
  // Show result view after success
  // -------------------------------------------------------------------------
  if (result) {
    return <QueueJoinResult entry={result} onReset={handleReset} />;
  }

  // -------------------------------------------------------------------------
  // Render form
  // -------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Submit error banner */}
      {submitError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
          <span className="text-red-500 text-xl mt-0.5" aria-hidden="true">
            ⚠️
          </span>
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      {/* Patient ID */}
      <div>
        <label htmlFor="jq-patientId" className={labelClass}>
          Patient ID <span className="text-red-500">*</span>
        </label>
        <input
          id="jq-patientId"
          type="text"
          placeholder="24-character MongoDB ObjectId"
          value={fields.patientId}
          onChange={handleChange("patientId")}
          disabled={submitting}
          aria-describedby="jq-patientId-hint"
          className={`${inputBase} ${borderColor("patientId")}`}
        />
        <p id="jq-patientId-hint" className="mt-1 text-sm text-gray-400">
          The patient's unique identifier. Temporary manual input until the
          Patient module is integrated.
        </p>
        {errorText(fieldErrors.patientId)}
      </div>

      {/* Triage ID */}
      <div>
        <label htmlFor="jq-triageId" className={labelClass}>
          Triage ID <span className="text-red-500">*</span>
        </label>
        <input
          id="jq-triageId"
          type="text"
          placeholder="24-character MongoDB ObjectId"
          value={fields.triageId}
          onChange={handleChange("triageId")}
          disabled={submitting}
          aria-describedby="jq-triageId-hint"
          className={`${inputBase} ${borderColor("triageId")}`}
        />
        <p id="jq-triageId-hint" className="mt-1 text-sm text-gray-400">
          The triage record ID from the Triage page. The backend uses this to
          determine the patient's priority level automatically.
        </p>
        {errorText(fieldErrors.triageId)}
      </div>

      {/* Queue selector */}
      <QueueSelector
        value={fields.queueId}
        onChange={(id) => {
          setFields((prev) => ({ ...prev, queueId: id }));
          if (fieldErrors.queueId) {
            setFieldErrors((prev) => ({ ...prev, queueId: undefined }));
          }
        }}
        disabled={submitting}
        label="Queue"
        required
        error={fieldErrors.queueId}
      />

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-700 text-white text-base font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
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
              Joining Queue…
            </>
          ) : (
            "Join Queue"
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={submitting}
          className="flex-1 sm:flex-none px-6 py-3 rounded-lg border border-gray-300 text-gray-700 text-base font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
