import type { CreateTriagePayload, TriageRecord } from "../types/triage";
import api from "./api";

// ---------------------------------------------------------------------------
// Backend response envelopes
// ---------------------------------------------------------------------------

interface TriageEnvelope {
  success: boolean;
  message?: string;
  data: TriageRecord;
}

interface TriageListEnvelope {
  success: boolean;
  count: number;
  data: TriageRecord[];
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * POST /api/triage
 * Create a new triage record.
 * Returns the saved TriageRecord.
 */
export const createTriage = async (
  payload: CreateTriagePayload
): Promise<TriageRecord> => {
  const response = await api.post<TriageEnvelope>("/triage", payload);
  return response.data.data;
};

/**
 * GET /api/triage/:id
 * Retrieve a single triage record by its MongoDB _id.
 */
export const getTriageById = async (id: string): Promise<TriageRecord> => {
  const response = await api.get<TriageEnvelope>(`/triage/${id}`);
  return response.data.data;
};

/**
 * GET /api/triage/patient/:patientId
 * Retrieve all triage records for a specific patient.
 */
export const getPatientTriage = async (
  patientId: string
): Promise<TriageRecord[]> => {
  const response = await api.get<TriageListEnvelope>(
    `/triage/patient/${patientId}`
  );
  return response.data.data;
};
