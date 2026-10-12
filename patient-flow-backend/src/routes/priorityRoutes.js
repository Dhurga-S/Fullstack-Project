const express = require('express');
const router = express.Router();
const { calculatePriorityHandler } = require('../controllers/priorityController');

// POST /api/priority/calculate - Calculate numerical priority from triage level
router.post('/calculate', calculatePriorityHandler);

module.exports = router;
