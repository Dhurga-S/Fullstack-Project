const mongoose = require('mongoose');
const TriageRecord = require('../models/TriageRecord');

// @desc    Create a new triage record
// @route   POST /api/triage
// @access  Public
const createTriage = async (req, res, next) => {
  try {
    const { patientId, symptoms, severity, vitalSigns, triageLevel, notes } = req.body || {};

    // Validate patientId
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid patientId (MongoDB ObjectId) is required'
      });
    }

    // Validate symptoms
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required and cannot be empty'
      });
    }

    // Validate severity
    const validSeverities = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
    if (!severity || typeof severity !== 'string' || !validSeverities.includes(severity.trim().toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Severity must be one of: ${validSeverities.join(', ')}`
      });
    }

    // Validate triageLevel
    const validTriageLevels = ['EMERGENCY', 'URGENT', 'NORMAL'];
    if (!triageLevel || typeof triageLevel !== 'string' || !validTriageLevels.includes(triageLevel.trim().toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Triage level must be one of: ${validTriageLevels.join(', ')}`
      });
    }

    // Create and save triage record
    const triageRecord = new TriageRecord({
      patientId,
      symptoms: symptoms.trim(),
      severity: severity.trim().toUpperCase(),
      vitalSigns,
      triageLevel: triageLevel.trim().toUpperCase(),
      notes
    });

    const savedRecord = await triageRecord.save();

    return res.status(201).json({
      success: true,
      message: 'Triage record created successfully',
      data: savedRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get triage record by ID
// @route   GET /api/triage/:id
// @access  Public
const getTriageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid triage record ID format'
      });
    }

    const triageRecord = await TriageRecord.findById(id);

    if (!triageRecord) {
      return res.status(404).json({
        success: false,
        message: 'Triage record not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: triageRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all triage records for a patient
// @route   GET /api/triage/patient/:patientId
// @access  Public
const getTriageByPatientId = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }

    const records = await TriageRecord.find({ patientId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTriage,
  getTriageById,
  getTriageByPatientId
};
