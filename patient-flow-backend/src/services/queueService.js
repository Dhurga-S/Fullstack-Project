const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');
const TriageRecord = require('../models/TriageRecord');
const { calculatePriority } = require('./priorityService');

/**
 * Service: Create a new queue for a department
 */
const createQueue = async ({ departmentId, name, averageConsultationTime }) => {
  if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
    const error = new Error('A valid departmentId is required');
    error.statusCode = 400;
    throw error;
  }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    const error = new Error('Queue name is required');
    error.statusCode = 400;
    throw error;
  }

  const consultationTime = averageConsultationTime !== undefined ? Number(averageConsultationTime) : 15;
  if (isNaN(consultationTime) || consultationTime <= 0) {
    const error = new Error('Average consultation time must be a positive number');
    error.statusCode = 400;
    throw error;
  }

  const queue = new Queue({
    departmentId,
    name: name.trim(),
    status: 'ACTIVE',
    averageConsultationTime: consultationTime
  });

  return await queue.save();
};

/**
 * Service: Get queue by ID
 */
const getQueueById = async (queueId) => {
  if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
    const error = new Error('Invalid queue ID format');
    error.statusCode = 400;
    throw error;
  }

  const queue = await Queue.findById(queueId);
  if (!queue) {
    const error = new Error('Queue not found');
    error.statusCode = 404;
    throw error;
  }

  return queue;
};

/**
 * Service: Add a patient to a queue using their triage record
 */
const joinQueue = async ({ patientId, triageId, queueId }) => {
  // Step 1: Validate IDs
  if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
    const error = new Error('A valid patientId is required');
    error.statusCode = 400;
    throw error;
  }

  if (!triageId || !mongoose.Types.ObjectId.isValid(triageId)) {
    const error = new Error('A valid triageId is required');
    error.statusCode = 400;
    throw error;
  }

  if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
    const error = new Error('A valid queueId is required');
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Find Triage Record
  const triageRecord = await TriageRecord.findById(triageId);
  if (!triageRecord) {
    const error = new Error('Triage record not found');
    error.statusCode = 404;
    throw error;
  }

  // Step 3: Find Queue
  const queue = await Queue.findById(queueId);
  if (!queue) {
    const error = new Error('Queue not found');
    error.statusCode = 404;
    throw error;
  }

  if (queue.status !== 'ACTIVE') {
    const error = new Error('Cannot join an inactive queue');
    error.statusCode = 400;
    throw error;
  }

  // Step 4: Calculate Priority
  const priority = await calculatePriority(triageRecord.triageLevel);

  // Step 5: Prevent Duplicate Active Queue Entries
  const existingActiveEntry = await QueueEntry.findOne({
    patientId,
    queueId,
    status: { $in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] }
  });

  if (existingActiveEntry) {
    const error = new Error('Patient is already active in this queue');
    error.statusCode = 409;
    throw error;
  }

  // Step 6: Generate Queue Number
  const lastEntry = await QueueEntry.findOne({ queueId }).sort({ queueNumber: -1 });
  const queueNumber = lastEntry ? lastEntry.queueNumber + 1 : 1;

  // Step 7: Create QueueEntry
  const queueEntry = new QueueEntry({
    patientId,
    triageId,
    queueId,
    departmentId: queue.departmentId,
    priority,
    queueNumber,
    status: 'WAITING',
    joinedAt: new Date(),
    estimatedWaitingTime: 0,
    actualWaitingTime: 0
  });

  return await queueEntry.save();
};

/**
 * Helper: Calculate estimated waiting time in minutes
 * Formula: (position - 1) * averageConsultationTime
 */
const calculateEstimatedWaitingTime = (position, averageConsultationTime) => {
  if (position <= 1) return 0;
  return Math.floor((position - 1) * averageConsultationTime);
};

/**
 * Service: Get ordered queue entries
 * By default returns only WAITING entries.
 * Pass includeAll=true to return entries of all statuses (used by history/analytics).
 */
const getOrderedQueue = async (queueId, { includeAll = false } = {}) => {
  if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
    const error = new Error('Invalid queue ID format');
    error.statusCode = 400;
    throw error;
  }

  const queue = await Queue.findById(queueId);
  if (!queue) {
    const error = new Error('Queue not found');
    error.statusCode = 404;
    throw error;
  }

  // Build query — include all statuses when requested, otherwise WAITING only
  const filter = includeAll
    ? { queueId }
    : { queueId, status: 'WAITING' };

  const rawEntries = await QueueEntry.find(filter).sort({ priority: 1, joinedAt: 1 });

  const avgTime = queue.averageConsultationTime || 15;

  // Build a position map for WAITING entries only (position is meaningless for others)
  const waitingEntries = includeAll
    ? rawEntries.filter((e) => e.status === 'WAITING')
    : rawEntries;

  const positionMap = new Map();
  waitingEntries.forEach((entry, idx) => {
    positionMap.set(entry._id.toString(), idx + 1);
  });

  const entries = rawEntries.map((entry) => {
    const entryObj = entry.toObject();
    const pos = positionMap.get(entry._id.toString());

    if (pos !== undefined) {
      entryObj.position = pos;
      entryObj.estimatedWaitingTime = calculateEstimatedWaitingTime(pos, avgTime);
    }
    // Non-WAITING entries keep their stored estimatedWaitingTime and actualWaitingTime

    return entryObj;
  });

  return {
    queueId: queue._id,
    count: entries.length,
    entries
  };
};

/**
 * Service: Get particular patient's queue position & estimated waiting time
 */
const getQueuePosition = async (queueId, queueEntryId) => {
  if (!queueId || !mongoose.Types.ObjectId.isValid(queueId)) {
    const error = new Error('Invalid queue ID format');
    error.statusCode = 400;
    throw error;
  }

  if (!queueEntryId || !mongoose.Types.ObjectId.isValid(queueEntryId)) {
    const error = new Error('Invalid queue entry ID format');
    error.statusCode = 400;
    throw error;
  }

  const queue = await Queue.findById(queueId);
  if (!queue) {
    const error = new Error('Queue not found');
    error.statusCode = 404;
    throw error;
  }

  const targetEntry = await QueueEntry.findById(queueEntryId);
  if (!targetEntry) {
    const error = new Error('Queue entry not found');
    error.statusCode = 404;
    throw error;
  }

  if (targetEntry.queueId.toString() !== queueId.toString()) {
    const error = new Error('Queue entry does not belong to the specified queue');
    error.statusCode = 400;
    throw error;
  }

  if (targetEntry.status !== 'WAITING') {
    const error = new Error('Patient is not currently waiting in the queue');
    error.statusCode = 400;
    error.status = targetEntry.status;
    throw error;
  }

  // Retrieve all WAITING entries for position calculation
  const waitingEntries = await QueueEntry.find({
    queueId,
    status: 'WAITING'
  }).sort({ priority: 1, joinedAt: 1 });

  const index = waitingEntries.findIndex(
    entry => entry._id.toString() === queueEntryId.toString()
  );

  if (index === -1) {
    const error = new Error('Patient is not currently waiting in the queue');
    error.statusCode = 400;
    error.status = targetEntry.status;
    throw error;
  }

  const position = index + 1;
  const avgTime = queue.averageConsultationTime || 15;
  const ewt = calculateEstimatedWaitingTime(position, avgTime);

  return {
    queueId: queue._id,
    queueEntryId: targetEntry._id,
    position,
    priority: targetEntry.priority,
    estimatedWaitingTime: ewt,
    status: targetEntry.status
  };
};

module.exports = {
  createQueue,
  getQueueById,
  joinQueue,
  getOrderedQueue,
  getQueuePosition,
  calculateEstimatedWaitingTime
};
