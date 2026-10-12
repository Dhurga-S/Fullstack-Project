import type {
  CreateQueuePayload,
  JoinQueuePayload,
  Queue,
  QueueEntry,
  QueueEntryPositionResponse,
  UpdateQueueEntryStatusPayload,
} from "../types/queue";
import api from "./api";

// ---------------------------------------------------------------------------
// Backend response envelope shapes
// ---------------------------------------------------------------------------

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface QueueEntriesEnvelope {
  success: boolean;
  queueId: string;
  count: number;
  entries: QueueEntry[];
}

interface PositionEnvelope {
  success: boolean;
  queueId: string;
  queueEntryId: string;
  position: number;
  priority: number;
  estimatedWaitingTime: number;
  status: string;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * GET /api/queues
 * Retrieve all queues. Pass status="ACTIVE" to filter by active queues.
 */
export const getQueues = async (status?: "ACTIVE" | "INACTIVE"): Promise<Queue[]> => {
  const params = status ? { status } : {};
  const response = await api.get<{ success: boolean; count: number; data: Queue[] }>(
    "/queues",
    { params }
  );
  return response.data.data;
};

/**
 * POST /api/queues
 * Create a new department queue.
 */
export const createQueue = async (
  payload: CreateQueuePayload
): Promise<Queue> => {
  const response = await api.post<ApiEnvelope<Queue>>("/queues", payload);
  return response.data.data;
};

/**
 * GET /api/queues/:queueId
 * Get queue details by ID.
 */
export const getQueue = async (queueId: string): Promise<Queue> => {
  const response = await api.get<ApiEnvelope<Queue>>(`/queues/${queueId}`);
  return response.data.data;
};

/**
 * POST /api/queues/join
 * Add a patient to an existing queue.
 */
export const joinQueue = async (
  payload: JoinQueuePayload
): Promise<QueueEntry> => {
  const response = await api.post<ApiEnvelope<QueueEntry>>(
    "/queues/join",
    payload
  );
  return response.data.data;
};

/**
 * GET /api/queues/:queueId/entries
 * Get queue entries in priority order.
 * Default (includeAll=false): only WAITING entries — used by Dashboard and Queue Management.
 * includeAll=true: all statuses — used by History, Performance, and Optimization pages.
 */
export const getQueueEntries = async (
  queueId: string,
  includeAll = false
): Promise<{ entries: QueueEntry[]; count: number }> => {
  const params = includeAll ? { includeAll: "true" } : {};
  const response = await api.get<QueueEntriesEnvelope>(
    `/queues/${queueId}/entries`,
    { params }
  );
  return {
    entries: response.data.entries,
    count: response.data.count,
  };
};

/**
 * GET /api/queues/:queueId/entries/:queueEntryId/position
 * Get a specific patient's position and estimated waiting time.
 */
export const getQueueEntryPosition = async (
  queueId: string,
  queueEntryId: string
): Promise<QueueEntryPositionResponse> => {
  const response = await api.get<PositionEnvelope>(
    `/queues/${queueId}/entries/${queueEntryId}/position`
  );
  // Reshape to the shared QueueEntryPositionResponse interface
  return {
    position: response.data.position,
    estimatedWaitingTime: response.data.estimatedWaitingTime,
    // The position endpoint doesn't return a full QueueEntry; cast minimal shape
    queueEntry: {
      _id: response.data.queueEntryId,
      queueId: response.data.queueId,
      priority: response.data.priority as 1 | 2 | 3,
      status: response.data.status as QueueEntry["status"],
    } as QueueEntry,
  };
};

/**
 * PATCH /api/queues/entries/:queueEntryId/status
 * Update the status of a queue entry.
 */
export const updateQueueEntryStatus = async (
  queueEntryId: string,
  payload: UpdateQueueEntryStatusPayload
): Promise<QueueEntry> => {
  const response = await api.patch<{ success: boolean; entry: QueueEntry }>(
    `/queues/entries/${queueEntryId}/status`,
    payload
  );
  return response.data.entry;
};

/**
 * Track a specific queue entry for a patient — all statuses.
 *
 * Strategy:
 *   1. Fetch ALL entries (includeAll=true) and search by _id.
 *      This handles WAITING, CALLED, IN_CONSULTATION, COMPLETED, NO_SHOW, CANCELLED.
 *   2. For WAITING entries the backend already sets position + EWT.
 *   3. For non-WAITING entries we return the full stored entry so the
 *      QueueStatusCard can show the correct status card (e.g. "Called", "Completed").
 *   4. If not found at all, throw a 404-style error.
 *
 * This keeps all business logic on the backend and allows all patients
 * to check their current queue status, not only those who are still WAITING.
 */
export const trackQueueEntry = async (
  queueId: string,
  queueEntryId: string
): Promise<QueueEntry> => {
  const { entries } = await getQueueEntries(queueId, true);
  const match = entries.find(
    (e) => e._id.toString() === queueEntryId.toString()
  );

  if (match) {
    return match;
  }

  // Entry not found in this queue at all.
  throw Object.assign(new Error("Queue entry not found in the specified queue."), {
    response: { status: 404, data: { message: "Queue entry not found. Please check the Queue ID and Queue Entry ID." } },
  });
};
