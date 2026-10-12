export type QueueStatus = "ACTIVE" | "INACTIVE";

export type QueueEntryStatus =
  | "WAITING"
  | "CALLED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

/** Priority: 1 = EMERGENCY, 2 = URGENT, 3 = NORMAL */
export type QueuePriority = 1 | 2 | 3;

export interface Queue {
  _id: string;
  departmentId: string;
  name: string;
  status: QueueStatus;
  averageConsultationTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueEntry {
  _id: string;
  patientId: string;
  triageId: string;
  queueId: string;
  departmentId: string;
  priority: QueuePriority;
  queueNumber: number;
  status: QueueEntryStatus;
  joinedAt: string;
  calledAt?: string;
  consultationStartedAt?: string;
  completedAt?: string;
  estimatedWaitingTime: number;
  actualWaitingTime: number;
  /** Position is returned by the position endpoint, not stored on the entry */
  position?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQueuePayload {
  departmentId: string;
  name: string;
  averageConsultationTime: number;
}

export interface JoinQueuePayload {
  patientId: string;
  triageId: string;
  queueId: string;
  /** departmentId is resolved server-side from the queue record; not required by the API. */
  departmentId?: string;
}

export interface UpdateQueueEntryStatusPayload {
  status: QueueEntryStatus;
}

export interface QueueEntryPositionResponse {
  position: number;
  estimatedWaitingTime: number;
  queueEntry: QueueEntry;
}
