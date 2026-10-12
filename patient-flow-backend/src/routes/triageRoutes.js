const express = require('express');
const router = express.Router();
const {
  createTriage,
  getTriageById,
  getTriageByPatientId
} = require('../controllers/triageController');

// POST /api/triage - Create a new triage record
router.post('/', createTriage);

// GET /api/triage/patient/:patientId - Get all triage records for a specific patient
router.get('/patient/:patientId', getTriageByPatientId);

// GET /api/triage/:id - Get a specific triage record by ID
router.get('/:id', getTriageById);

module.exports = router;
