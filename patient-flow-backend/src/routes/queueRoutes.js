const express = require('express');
const router = express.Router();
const {
  getAllQueues,
  createQueue,
  getQueueById,
  joinQueue,
  getOrderedQueue,
  getQueueEntryPosition,
  updateQueueEntryStatus
} = require('../controllers/queueController');

// GET /api/queues - Get all queues (optional ?status=ACTIVE filter)
router.get('/', getAllQueues);

// POST /api/queues - Create a new department queue
router.post('/', createQueue);

// POST /api/queues/join - Add a patient to a queue
router.post('/join', joinQueue);

// PATCH /api/queues/entries/:queueEntryId/status - Update QueueEntry status
router.patch('/entries/:queueEntryId/status', updateQueueEntryStatus);

// GET /api/queues/:queueId/entries/:queueEntryId/position - Get a specific patient's position and EWT
router.get('/:queueId/entries/:queueEntryId/position', getQueueEntryPosition);

// GET /api/queues/:queueId/entries - Get all WAITING entries for a queue in priority order
router.get('/:queueId/entries', getOrderedQueue);

// GET /api/queues/:queueId - Get queue details by ID
router.get('/:queueId', getQueueById);

module.exports = router;
