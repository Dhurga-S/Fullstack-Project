const queueService = require('../services/queueService');
const queueStatusService = require('../services/queueStatusService');
const Queue = require('../models/Queue');

// @desc    Get all queues (optionally filtered by status)
// @route   GET /api/queues
// @access  Public
const getAllQueues = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }
    const queues = await Queue.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: queues.length,
      data: queues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new department queue
// @route   POST /api/queues
// @access  Public
const createQueue = async (req, res, next) => {
  try {
    const { departmentId, name, averageConsultationTime } = req.body || {};
    const newQueue = await queueService.createQueue({
      departmentId,
      name,
      averageConsultationTime
    });

    return res.status(201).json({
      success: true,
      message: 'Queue created successfully',
      data: newQueue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a queue by ID
// @route   GET /api/queues/:queueId
// @access  Public
const getQueueById = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const queue = await queueService.getQueueById(queueId);

    return res.status(200).json({
      success: true,
      data: queue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a patient to a queue
// @route   POST /api/queues/join
// @access  Public
const joinQueue = async (req, res, next) => {
  try {
    const { patientId, triageId, queueId } = req.body || {};
    const queueEntry = await queueService.joinQueue({
      patientId,
      triageId,
      queueId
    });

    return res.status(201).json({
      success: true,
      message: 'Patient added to queue successfully',
      data: queueEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get entries for a queue. Default: WAITING only. Pass ?includeAll=true for all statuses.
// @route   GET /api/queues/:queueId/entries
// @access  Public
const getOrderedQueue = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const includeAll = req.query.includeAll === 'true';
    const result = await queueService.getOrderedQueue(queueId, { includeAll });

    return res.status(200).json({
      success: true,
      queueId: result.queueId,
      count: result.count,
      entries: result.entries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get particular patient's position in queue
// @route   GET /api/queues/:queueId/entries/:queueEntryId/position
// @access  Public
const getQueueEntryPosition = async (req, res, next) => {
  try {
    const { queueId, queueEntryId } = req.params;
    const result = await queueService.getQueuePosition(queueId, queueEntryId);

    return res.status(200).json({
      success: true,
      queueId: result.queueId,
      queueEntryId: result.queueEntryId,
      position: result.position,
      priority: result.priority,
      estimatedWaitingTime: result.estimatedWaitingTime,
      status: result.status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update QueueEntry status with transition validation
// @route   PATCH /api/queues/entries/:queueEntryId/status
// @access  Public
const updateQueueEntryStatus = async (req, res, next) => {
  try {
    const { queueEntryId } = req.params;
    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updatedEntry = await queueStatusService.updateQueueEntryStatus(queueEntryId, status);

    return res.status(200).json({
      success: true,
      message: 'Queue entry status updated successfully',
      entry: updatedEntry
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQueues,
  createQueue,
  getQueueById,
  joinQueue,
  getOrderedQueue,
  getQueueEntryPosition,
  updateQueueEntryStatus
};
