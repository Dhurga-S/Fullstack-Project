import type { TriageLevel } from "./triage";

export interface CalculatePriorityPayload {
  triageLevel: TriageLevel;
}

export interface CalculatePriorityResponse {
  priority: number;
  triageLevel: TriageLevel;
}
