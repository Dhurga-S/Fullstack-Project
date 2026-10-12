import { useState } from "react";
import { createTriage } from "../../services/triageService";
import type {
  CreateTriagePayload,
  TriageLevel,
  TriageRecord,
  TriageSeverity,
  VitalSigns,
} from "../../types/triage";
import VitalSignsForm from "./VitalSignsForm";

// ---------------------------------------------------------------------------
// Validation helper: MongoDB ObjectId is a 24-char hex string
// ---------------------------------------------------------------------------
const isValidObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value.trim());

// ---------------------------------------------------------------------------
// Form field types
// ---------------------------------------------------------------------------
interface FormFields {
  patientId: string;
  symptoms: string;
  severity: TriageSeverity | "";
  triageLevel: TriageLevel | "";
  notes: string;
  vitalSigns: VitalSigns;
}

const EMPTY_FORM: FormFields = {
  patientId: "",
  symptoms: "",
  severity: "",
  triageLevel: "",
  notes: "",
  vitalSigns: {},
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
interface FieldErrors {
  patientId?: string;
  symptoms?: string;
  severity?: string;
  triageLevel?: string;
}

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.patientId.trim()) {
    errors.patientId = "Patient ID is required.";
  } else if (!isValidObjectId(fields.patientId)) {
    errors.patientId = "Patient ID must be a valid 24-character MongoDB ObjectId.";
  }

  if (!fields.symptoms.trim()) {
    errors.symptoms = "Symptoms are required.";
  }

  if (!fields.severity) {
    errors.severity = "Severity is required.";
  }

  if (!fields.triageLevel) {
    errors.triageLevel = "Triage level is required.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Shared input class
// ---------------------------------------------------------------------------
const inputClass =
  "w-full px-4 py-3 rounded-lg border text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-base font-medium text-gray-700 mb-1.5";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TriageForm() {
  const [fields, setFields] = useState<FormFields>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdRecord, setCreatedRecord] = useState<TriageRecord | null>(null);

  // -------------------------------------------------------------------------
  // Field change handlers
  // -------------------------------------------------------------------------
  const handleChange =
    (field: keyof Omit<FormFields, "vitalSigns">) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear the error for this field as the user types
      if (fieldErrors[field as keyof FieldErrors]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleVitalSigns = (updated: VitalSigns) => {
    setFields((prev) => ({ ...prev, vitalSigns: updated }));
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setCreatedRecord(null);

    // Build payload — omit empty optional fields
    const vitalSigns: VitalSigns = {};
    if (fields.vitalSigns.temperature !== undefined)
      vitalSigns.temperature = fields.vitalSigns.temperature;
    if (fields.vitalSigns.heartRate !== undefined)
      vitalSigns.heartRate = fields.vitalSigns.heartRate;
    if (fields.vitalSigns.bloodPressure?.trim())
      vitalSigns.bloodPressure = fields.vitalSigns.bloodPressure.trim();
    if (fields.vitalSigns.oxygenSaturation !== undefined)
      vitalSigns.oxygenSaturation = fields.vitalSigns.oxygenSaturation;

    const payload: CreateTriagePayload = {
      patientId: fields.patientId.trim(),
      symptoms: fields.symptoms.trim(),
      severity: fields.severity as TriageSeverity,
      triageLevel: fields.triageLevel as TriageLevel,
      ...(fields.notes.trim() && { notes: fields.notes.trim() }),
      ...(Object.keys(vitalSigns).length > 0 && { vitalSigns }),
    };

    try {
      const record = await createTriage(payload);
      setCreatedRecord(record);
      setFields(EMPTY_FORM); // Clear form on success
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })
        ?.response;

      const serverMessage = status?.data?.message;

      if (status?.status === 400) {
        setSubmitError(
          serverMessage ?? "Invalid data. Please check the form fields."
        );
      } else if (status?.status === 404) {
        setSubmitError("Endpoint not found. Please check that the backend is running.");
      } else {
        setSubmitError(
          serverMessage ??
            "Unable to create triage record. Please make sure the backend is running."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  const handleReset = () => {
    setFields(EMPTY_FORM);
    setFieldErrors({});
    setSubmitError(null);
    setCreatedRecord(null);
  };

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------
  const errorText = (msg?: string) =>
    msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null;

  const borderColor = (field: keyof FieldErrors) =>
    fieldErrors[field] ? "border-red-400" : "border-gray-300";

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Success banner                                                       */}
      {/* ------------------------------------------------------------------ */}
      {createdRecord && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 flex gap-3">
          <span className="text-green-500 text-xl mt-0.5" aria-hidden="true">
            ✅
          </span>
          <div>
            <p className="font-semibold text-green-800">
              Triage record created successfully.
            </p>
            <p className="text-green-700 text-sm mt-0.5">
              Record ID:{" "}
              <span className="font-mono font-medium">{createdRecord._id}</span>
            </p>
            <p className="text-green-600 text-xs mt-1">
              The form has been cleared and is ready for a new entry.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Submit error banner                                                  */}
      {/* ------------------------------------------------------------------ */}
      {submitError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
          <span className="text-red-500 text-xl mt-0.5" aria-hidden="true">
            ⚠️
          </span>
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      {/* ================================================================== */}
      {/* Section 1: Patient Information                                       */}
      {/* ================================================================== */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Section 1 — Patient Information
        </h3>

        <div>
          <label htmlFor="patientId" className={labelClass}>
            Patient ID <span className="text-red-500">*</span>
          </label>
          <input
            id="patientId"
            type="text"
            placeholder="Enter 24-character MongoDB ObjectId"
            value={fields.patientId}
            onChange={handleChange("patientId")}
            disabled={submitting}
            aria-describedby="patientId-hint"
            className={`${inputClass} ${borderColor("patientId")}`}
          />
          <p
            id="patientId-hint"
            className="mt-1 text-xs text-gray-400"
          >
            Temporary manual entry — will be replaced by patient lookup in a
            later part.
          </p>
          {errorText(fieldErrors.patientId)}
        </div>
      </section>

      {/* ================================================================== */}
      {/* Section 2: Symptoms & Severity                                       */}
      {/* ================================================================== */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Section 2 — Symptoms & Severity
        </h3>

        <div className="space-y-5">
          {/* Symptoms */}
          <div>
            <label htmlFor="symptoms" className={labelClass}>
              Symptoms <span className="text-red-500">*</span>
            </label>
            <textarea
              id="symptoms"
              rows={4}
              placeholder="Describe the patient's presenting symptoms…"
              value={fields.symptoms}
              onChange={handleChange("symptoms")}
              disabled={submitting}
              className={`${inputClass} resize-none ${borderColor("symptoms")}`}
            />
            {errorText(fieldErrors.symptoms)}
          </div>

          {/* Severity */}
          <div>
            <label htmlFor="severity" className={labelClass}>
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              id="severity"
              value={fields.severity}
              onChange={handleChange("severity")}
              disabled={submitting}
              className={`${inputClass} ${borderColor("severity")}`}
            >
              <option value="" disabled>
                Select severity…
              </option>
              <option value="LOW">LOW</option>
              <option value="MODERATE">MODERATE</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            {errorText(fieldErrors.severity)}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Section 3: Vital Signs                                               */}
      {/* ================================================================== */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Section 3 — Vital Signs
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          All fields in this section are optional. Leave blank if not measured.
        </p>

        <VitalSignsForm
          values={fields.vitalSigns}
          onChange={handleVitalSigns}
          disabled={submitting}
        />
      </section>

      {/* ================================================================== */}
      {/* Section 4: Triage Assessment                                         */}
      {/* ================================================================== */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Section 4 — Triage Assessment
        </h3>

        <div className="space-y-5">
          {/* Triage Level */}
          <div>
            <label htmlFor="triageLevel" className={labelClass}>
              Triage Level <span className="text-red-500">*</span>
            </label>
            <select
              id="triageLevel"
              value={fields.triageLevel}
              onChange={handleChange("triageLevel")}
              disabled={submitting}
              className={`${inputClass} ${borderColor("triageLevel")}`}
            >
              <option value="" disabled>
                Select triage level…
              </option>
              <option value="EMERGENCY">EMERGENCY</option>
              <option value="URGENT">URGENT</option>
              <option value="NORMAL">NORMAL</option>
            </select>
            {errorText(fieldErrors.triageLevel)}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className={labelClass}>
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Any additional clinical notes…"
              value={fields.notes}
              onChange={handleChange("notes")}
              disabled={submitting}
              className={`${inputClass} resize-none border-gray-300`}
            />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Action buttons                                                       */}
      {/* ================================================================== */}
      <div className="flex flex-col sm:flex-row gap-3 pb-2">
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
              Submitting…
            </>
          ) : (
            "Submit Triage"
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
