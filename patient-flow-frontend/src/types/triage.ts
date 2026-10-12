export type TriageSeverity = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type TriageLevel = "EMERGENCY" | "URGENT" | "NORMAL";

export interface VitalSigns {
  temperature?: number;
  heartRate?: number;
  bloodPressure?: string;
  oxygenSaturation?: number;
}

export interface TriageRecord {
  _id: string;
  patientId: string;
  symptoms: string;
  severity: TriageSeverity;
  vitalSigns?: VitalSigns;
  triageLevel: TriageLevel;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTriagePayload {
  patientId: string;
  symptoms: string;
  severity: TriageSeverity;
  vitalSigns?: VitalSigns;
  triageLevel: TriageLevel;
  notes?: string;
}
