import type { OptimizationAnalysisResult } from "../types/optimization";
import type { Queue, QueueEntry } from "../types/queue";
import {
  evaluateOptimizationRules,
  type OptimizationRuleOptions,
} from "../utils/optimizationRules";
import { getQueue, getQueueEntries } from "./queueService";

export interface QueueOptimizationData {
  queue: Queue | null;
  entries: QueueEntry[];
  analysis: OptimizationAnalysisResult;
}

/**
 * Service: Fetches queue metadata and queue entries from the backend,
 * then evaluates rule-based operational recommendations.
 *
 * Reuses existing GET /api/queues/:queueId and GET /api/queues/:queueId/entries endpoints.
 * Does NOT create new endpoints or modify backend data.
 */
export const analyzeQueueFlow = async (
  queueId: string,
  options?: OptimizationRuleOptions
): Promise<QueueOptimizationData> => {
  // includeAll=true so Rules D (CALLED) and F (COMPLETED) receive the right data.
  // Optimization rules only read status/priority/estimatedWaitingTime — they never
  // modify entries, so fetching all statuses is safe.
  const [queue, entriesResult] = await Promise.all([
    getQueue(queueId).catch(() => null),
    getQueueEntries(queueId, true),
  ]);

  const analysis = evaluateOptimizationRules(
    queueId,
    entriesResult.entries,
    options
  );

  return {
    queue,
    entries: entriesResult.entries,
    analysis,
  };
};
