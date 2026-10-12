import type {
  OptimizationAnalysisResult,
  OptimizationMetrics,
  OptimizationRecommendation,
} from "../types/optimization";
import type { QueueEntry } from "../types/queue";

/**
 * Default threshold for queue congestion rule (configurable initial rule,
 * not a clinically validated threshold).
 */
export const DEFAULT_CONGESTION_THRESHOLD = 5;

/**
 * Default threshold in minutes for long estimated waiting time rule.
 */
export const DEFAULT_LONG_WAIT_THRESHOLD_MINUTES = 30;

export interface OptimizationRuleOptions {
  /** Configurable congestion threshold (default: 5) */
  congestionThreshold?: number;
  /** Configurable long wait threshold in minutes (default: 30) */
  longWaitThresholdMinutes?: number;
}

/**
 * Computes summary metrics directly from actual backend queue entries.
 * No metrics are fabricated.
 */
export function calculateOptimizationMetrics(
  entries: QueueEntry[]
): OptimizationMetrics {
  const waitingEntries = entries.filter((e) => e.status === "WAITING");

  const waitingPatients = waitingEntries.length;
  const emergencyPatientsWaiting = waitingEntries.filter(
    (e) => e.priority === 1
  ).length;
  const patientsCalled = entries.filter((e) => e.status === "CALLED").length;
  const patientsInConsultation = entries.filter(
    (e) => e.status === "IN_CONSULTATION"
  ).length;
  const longEstimatedWaitPatients = waitingEntries.filter(
    (e) =>
      typeof e.estimatedWaitingTime === "number" &&
      !isNaN(e.estimatedWaitingTime) &&
      e.estimatedWaitingTime >= DEFAULT_LONG_WAIT_THRESHOLD_MINUTES
  ).length;

  return {
    waitingPatients,
    emergencyPatientsWaiting,
    patientsCalled,
    patientsInConsultation,
    longEstimatedWaitPatients,
  };
}

/**
 * Evaluates operational recommendation rules based solely on actual queue entries.
 *
 * Rules:
 * - Rule A: Emergency patients waiting (status === "WAITING" && priority === 1)
 * - Rule B: Large waiting queue (status === "WAITING" count >= 5)
 * - Rule C: Long estimated waiting time (status === "WAITING" && estimatedWaitingTime >= 30)
 * - Rule D: Called patients (status === "CALLED" count > 0)
 * - Rule E: No waiting patients (status === "WAITING" count === 0)
 * - Rule F: No completed patients (status === "COMPLETED" count === 0)
 *
 * Clinical & Operational Safety:
 * - Recommendations are transparent rule-based guidance, NOT AI/ML.
 * - Recommendations do NOT mutate data, update statuses, or override triage.
 */
export function evaluateOptimizationRules(
  queueId: string,
  entries: QueueEntry[],
  options: OptimizationRuleOptions = {}
): OptimizationAnalysisResult {
  const congestionThreshold =
    options.congestionThreshold ?? DEFAULT_CONGESTION_THRESHOLD;
  const longWaitThresholdMinutes =
    options.longWaitThresholdMinutes ?? DEFAULT_LONG_WAIT_THRESHOLD_MINUTES;

  const recommendations: OptimizationRecommendation[] = [];

  const waitingEntries = entries.filter((e) => e.status === "WAITING");
  const emergencyWaitingEntries = waitingEntries.filter(
    (e) => e.priority === 1
  );
  const calledEntries = entries.filter((e) => e.status === "CALLED");
  const completedEntries = entries.filter((e) => e.status === "COMPLETED");

  const longWaitEntries = waitingEntries.filter(
    (e) =>
      typeof e.estimatedWaitingTime === "number" &&
      !isNaN(e.estimatedWaitingTime) &&
      e.estimatedWaitingTime >= longWaitThresholdMinutes
  );

  // -------------------------------------------------------------------------
  // Rule A — Emergency patients waiting
  // Condition: One or more entries have status === "WAITING" and priority === 1
  // -------------------------------------------------------------------------
  if (emergencyWaitingEntries.length > 0) {
    const queueNumbers = emergencyWaitingEntries.map((e) => e.queueNumber);
    recommendations.push({
      id: "RULE_A_EMERGENCY_WAITING",
      ruleCode: "Rule A",
      importance: "HIGH",
      title: "Emergency patients are waiting.",
      explanation: `${emergencyWaitingEntries.length} patient(s) with emergency priority (Priority 1) are currently waiting in the queue. Immediate clinical triage review is required.`,
      suggestedAction:
        "Review these patients immediately and ensure the hospital's emergency triage protocol is followed.",
      supportingData: {
        count: emergencyWaitingEntries.length,
        queueNumbers,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Rule B — Large waiting queue
  // Condition: At least 5 entries with status === "WAITING"
  // -------------------------------------------------------------------------
  if (waitingEntries.length >= congestionThreshold) {
    recommendations.push({
      id: "RULE_B_QUEUE_CONGESTION",
      ruleCode: "Rule B",
      importance: "MEDIUM",
      title: "Queue congestion detected.",
      explanation: `${waitingEntries.length} patients are currently waiting, reaching the operational threshold of ${congestionThreshold} waiting patients.`,
      suggestedAction:
        "Review available staff capacity and consider opening additional consultation capacity if clinically and operationally appropriate.",
      supportingData: {
        count: waitingEntries.length,
        threshold: congestionThreshold,
        queueNumbers: waitingEntries.map((e) => e.queueNumber),
      },
    });
  }

  // -------------------------------------------------------------------------
  // Rule C — Long estimated waiting time
  // Condition: A waiting entry has estimatedWaitingTime >= 30 minutes
  // Backend estimated waiting time is displayed directly without recalculation.
  // -------------------------------------------------------------------------
  if (longWaitEntries.length > 0) {
    recommendations.push({
      id: "RULE_C_LONG_WAITING_TIME",
      ruleCode: "Rule C",
      importance: "MEDIUM",
      title: "Long estimated waiting time detected.",
      explanation: `${longWaitEntries.length} patient(s) have an estimated waiting time of ${longWaitThresholdMinutes} minutes or longer based on current queue positions and consultation rates.`,
      suggestedAction:
        "Review queue capacity and communicate expected delays to patients.",
      supportingData: {
        count: longWaitEntries.length,
        threshold: longWaitThresholdMinutes,
        queueNumbers: longWaitEntries.map((e) => e.queueNumber),
        patientDetails: longWaitEntries.map((e) => ({
          queueNumber: e.queueNumber,
          estimatedWaitingTime: e.estimatedWaitingTime,
        })),
      },
    });
  }

  // -------------------------------------------------------------------------
  // Rule D — Called patients
  // Condition: An entry has status === "CALLED"
  // -------------------------------------------------------------------------
  if (calledEntries.length > 0) {
    recommendations.push({
      id: "RULE_D_CALLED_PATIENTS",
      ruleCode: "Rule D",
      importance: "INFO",
      title: "Called patients awaiting consultation.",
      explanation: `${calledEntries.length} patient(s) have already been called to consultation.`,
      suggestedAction:
        "Check whether the patients have reached the consultation area before calling additional patients.",
      supportingData: {
        count: calledEntries.length,
        queueNumbers: calledEntries.map((e) => e.queueNumber),
      },
    });
  }

  // -------------------------------------------------------------------------
  // Rule E — No waiting patients
  // Condition: No entries have status === "WAITING"
  // -------------------------------------------------------------------------
  if (waitingEntries.length === 0) {
    recommendations.push({
      id: "RULE_E_NO_WAITING_PATIENTS",
      ruleCode: "Rule E",
      importance: "INFO",
      title: "No patients are currently waiting.",
      explanation:
        "No patients are currently queued for consultation in this queue.",
      suggestedAction:
        "Standard queue monitoring is sufficient. Do not increase consultation capacity when no waiting queue exists.",
      supportingData: {
        count: 0,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Rule F — No completed patients
  // Condition: There are no entries with status === "COMPLETED"
  // -------------------------------------------------------------------------
  if (completedEntries.length === 0) {
    recommendations.push({
      id: "RULE_F_NO_COMPLETED_PATIENTS",
      ruleCode: "Rule F",
      importance: "INFO",
      title: "No completed consultations are available in this queue yet.",
      explanation:
        "No completed consultation records were returned for this queue. Historical waiting-time performance cannot be evaluated without completed records.",
      suggestedAction:
        "Continue tracking consultations as they finish. Waiting-time conclusions should only be formed once completed patient data is available.",
      supportingData: {
        count: 0,
      },
    });
  }

  const metrics = calculateOptimizationMetrics(entries);
  const highImportanceAlerts = recommendations.filter(
    (r) => r.importance === "HIGH"
  );
  const otherRecommendations = recommendations.filter(
    (r) => r.importance !== "HIGH"
  );

  return {
    queueId,
    analyzedAt: new Date(),
    metrics,
    recommendations,
    highImportanceAlerts,
    otherRecommendations,
    totalEntriesLoaded: entries.length,
  };
}
