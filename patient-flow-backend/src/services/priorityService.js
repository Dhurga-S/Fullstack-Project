const mongoose = require('mongoose');
const PriorityRule = require('../models/PriorityRule');

// Default static mapping rules
const DEFAULT_PRIORITY_MAP = {
  EMERGENCY: 1,
  URGENT: 2,
  NORMAL: 3
};

/**
 * Calculates queue priority based on triage level.
 * 1 = EMERGENCY (Highest)
 * 2 = URGENT (Medium)
 * 3 = NORMAL (Normal)
 * 
 * @param {string} triageLevel - Triage level (EMERGENCY, URGENT, NORMAL)
 * @returns {Promise<number>} Returns numerical priority (1, 2, or 3)
 */
const calculatePriority = async (triageLevel) => {
  if (!triageLevel || typeof triageLevel !== 'string' || triageLevel.trim() === '') {
    throw new Error('Invalid triage level');
  }

  const normalizedLevel = triageLevel.trim().toUpperCase();

  // If MongoDB is connected, check for a configurable rule in database
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const dbRule = await PriorityRule.findOne({
        triageLevel: normalizedLevel,
        active: true
      });

      if (dbRule && [1, 2, 3].includes(dbRule.priority)) {
        return dbRule.priority;
      }
    } catch (error) {
      // Fallback to static mapping if DB query fails
    }
  }

  // Default mapping fallback
  if (normalizedLevel in DEFAULT_PRIORITY_MAP) {
    return DEFAULT_PRIORITY_MAP[normalizedLevel];
  }

  throw new Error('Invalid triage level');
};

module.exports = {
  calculatePriority,
  DEFAULT_PRIORITY_MAP
};
