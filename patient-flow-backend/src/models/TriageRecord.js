const mongoose = require('mongoose');

const triageRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Patient ID is required']
    },
    symptoms: {
      type: String,
      required: [true, 'Symptoms description is required'],
      trim: true
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: {
        values: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
        message: '{VALUE} is not a valid severity level'
      }
    },
    vitalSigns: {
      temperature: { type: Number },
      heartRate: { type: Number },
      bloodPressure: { type: String, trim: true },
      oxygenSaturation: { type: Number }
    },
    triageLevel: {
      type: String,
      required: [true, 'Triage level is required'],
      enum: {
        values: ['EMERGENCY', 'URGENT', 'NORMAL'],
        message: '{VALUE} is not a valid triage level'
      }
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TriageRecord', triageRecordSchema);
