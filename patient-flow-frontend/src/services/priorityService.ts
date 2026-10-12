import type {
  CalculatePriorityPayload,
  CalculatePriorityResponse,
} from "../types/priority";
import api from "./api";

/**
 * POST /api/priority/calculate
 * Ask the backend to calculate the numerical priority for a given triage level.
 * The frontend does NOT compute priority — the backend is the source of truth.
 */
export const calculatePriority = async (
  payload: CalculatePriorityPayload
): Promise<CalculatePriorityResponse> => {
  const response = await api.post<CalculatePriorityResponse>(
    "/priority/calculate",
    payload
  );
  return response.data;
};
