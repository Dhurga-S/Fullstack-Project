export type RecommendationImportance = "HIGH" | "MEDIUM" | "INFO";

export type RecommendationRuleId =
  | "RULE_A_EMERGENCY_WAITING"
  | "RULE_B_QUEUE_CONGESTION"
  | "RULE_C_LONG_WAITING_TIME"
  | "RULE_D_CALLED_PATIENTS"
  | "RULE_E_NO_WAITING_PATIENTS"
  | "RULE_F_NO_COMPLETED_PATIENTS";

export interface SupportingPatientDetail {
  queueNumber: number;
  estimatedWaitingTime?: number;
}

export interface RecommendationSupportingData {
  count?: number;
  threshold?: number;
  queueNumbers?: number[];
  patientDetails?: SupportingPatientDetail[];
}

export interface OptimizationRecommendation {
  id: RecommendationRuleId;
  ruleCode: "Rule A" | "Rule B" | "Rule C" | "Rule D" | "Rule E" | "Rule F";
  importance: RecommendationImportance;
  title: string;
  explanation: string;
  suggestedAction: string;
  supportingData?: RecommendationSupportingData;
}

export interface OptimizationMetrics {
  /** Count of entries with status === 'WAITING' */
  waitingPatients: number;
  /** Count of entries with status === 'WAITING' and priority === 1 */
  emergencyPatientsWaiting: number;
  /** Count of entries with status === 'CALLED' */
  patientsCalled: number;
  /** Count of entries with status === 'IN_CONSULTATION' */
  patientsInConsultation: number;
  /** Count of waiting entries with estimatedWaitingTime >= 30 */
  longEstimatedWaitPatients: number;
}

export interface OptimizationAnalysisResult {
  queueId: string;
  analyzedAt: Date;
  metrics: OptimizationMetrics;
  recommendations: OptimizationRecommendation[];
  highImportanceAlerts: OptimizationRecommendation[];
  otherRecommendations: OptimizationRecommendation[];
  totalEntriesLoaded: number;
}
