const mongoose = require('mongoose');
const QueueEntry = require('../models/QueueEntry');

// Allowed status transition map
const VALID_TRANSITIONS = {
  WAITING: ['CALLED', 'CANCELLED'],
  CALLED: ['IN_CONSULTATION', 'NO_SHOW'],
  IN_CONSULTATION: ['COMPLETED'],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: []
};

const ALLOWED_STATUSES = [
  'WAITING',
  'CALLED',
  'IN_CONSULTATION',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED'
];

/**
 * Service: Update QueueEntry status with transition validation, timestamps & actualWaitingTime
 * 
 * @param {string} queueEntryId - MongoDB ObjectId of the QueueEntry
 * @param {string} newStatus - New status value to transition to
 * @returns {Promise<Object>} Updated QueueEntry document
 */
const updateQueueEntryStatus = async (queueEntryId, newStatus) => {
  // 1. Validate ObjectId
  if (!queueEntryId || !mongoose.Types.ObjectId.isValid(queueEntryId)) {
    const error = new Error('Invalid queue entry ID format');
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate input newStatus
  if (!newStatus || typeof newStatus !== 'string' || newStatus.trim() === '') {
    const error = new Error('Status is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedStatus = newStatus.trim().toUpperCase();

  if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
    const error = new Error(`Invalid status: ${newStatus}`);
    error.statusCode = 400;
    throw error;
  }

  // 3. Find QueueEntry
  const queueEntry = await QueueEntry.findById(queueEntryId);
  if (!queueEntry) {
    const error = new Error('Queue entry not found');
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = queueEntry.status;

  // 4. Check same status
  if (currentStatus === normalizedStatus) {
    const error = new Error(`Queue entry is already in ${normalizedStatus} status`);
    error.statusCode = 400;
    throw error;
  }

  // 5. Validate transition rules
  const allowedTargets = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedTargets.includes(normalizedStatus)) {
    const error = new Error(`Invalid status transition from ${currentStatus} to ${normalizedStatus}`);
    error.statusCode = 400;
    throw error;
  }

  // 6. Update status, set timestamps & calculate actualWaitingTime
  queueEntry.status = normalizedStatus;
  const now = new Date();

  if (currentStatus === 'WAITING' && normalizedStatus === 'CALLED') {
    queueEntry.calledAt = now;

    // Calculate actual waiting time (calledAt - joinedAt in minutes)
    if (queueEntry.joinedAt && queueEntry.joinedAt instanceof Date && !isNaN(queueEntry.joinedAt.getTime())) {
      const diffMs = now.getTime() - queueEntry.joinedAt.getTime();
      let diffMinutes = Math.round(diffMs / (1000 * 60));

      // Safeguard: Ensure no negative or NaN values
      if (isNaN(diffMinutes) || diffMinutes < 0) {
        diffMinutes = 0;
      }

      queueEntry.actualWaitingTime = diffMinutes;
    } else {
      queueEntry.actualWaitingTime = 0;
    }
  } else if (currentStatus === 'CALLED' && normalizedStatus === 'IN_CONSULTATION') {
    queueEntry.consultationStartedAt = now;
  } else if (currentStatus === 'IN_CONSULTATION' && normalizedStatus === 'COMPLETED') {
    queueEntry.completedAt = now;
  }

  // 7. Save and return
  return await queueEntry.save();
};

module.exports = {
  updateQueueEntryStatus,
  VALID_TRANSITIONS,
  ALLOWED_STATUSES
};
