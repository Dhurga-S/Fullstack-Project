const { calculatePriority } = require('../services/priorityService');

// @desc    Calculate priority level from triage level
// @route   POST /api/priority/calculate
// @access  Public
const calculatePriorityHandler = async (req, res, next) => {
  try {
    const { triageLevel } = req.body || {};

    if (!triageLevel || typeof triageLevel !== 'string' || triageLevel.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid triage level'
      });
    }

    const priority = await calculatePriority(triageLevel);
    const normalizedLevel = triageLevel.trim().toUpperCase();

    return res.status(200).json({
      success: true,
      triageLevel: normalizedLevel,
      priority: priority
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid triage level'
    });
  }
};

module.exports = {
  calculatePriorityHandler
};
