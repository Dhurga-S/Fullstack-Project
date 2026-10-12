const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Patient ID is required'],
      index: true
    },
    triageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TriageRecord',
      required: [true, 'Triage ID is required']
    },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: [true, 'Queue ID is required'],
      index: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Department ID is required']
    },
    priority: {
      type: Number,
      required: [true, 'Priority level is required'],
      enum: {
        values: [1, 2, 3],
        message: 'Priority must be 1 (EMERGENCY), 2 (URGENT), or 3 (NORMAL)'
      },
      index: true
    },
    queueNumber: {
      type: Number,
      required: [true, 'Queue number is required']
    },
    status: {
      type: String,
      required: [true, 'Entry status is required'],
      enum: {
        values: ['WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'CANCELLED'],
        message: '{VALUE} is not a valid queue entry status'
      },
      default: 'WAITING',
      index: true
    },
    joinedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    calledAt: {
      type: Date
    },
    consultationStartedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    estimatedWaitingTime: {
      type: Number,
      default: 0,
      min: [0, 'Estimated waiting time cannot be negative']
    },
    actualWaitingTime: {
      type: Number,
      default: 0,
      min: [0, 'Actual waiting time cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient retrieval of waiting patients in queue order
queueEntrySchema.index({ queueId: 1, status: 1, priority: 1, joinedAt: 1 });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
