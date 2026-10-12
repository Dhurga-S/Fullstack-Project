const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Department ID is required']
    },
    name: {
      type: String,
      required: [true, 'Queue name is required'],
      trim: true
    },
    status: {
      type: String,
      required: [true, 'Queue status is required'],
      enum: {
        values: ['ACTIVE', 'INACTIVE'],
        message: '{VALUE} is not a valid queue status'
      },
      default: 'ACTIVE'
    },
    averageConsultationTime: {
      type: Number,
      required: [true, 'Average consultation time is required'],
      default: 15,
      min: [1, 'Average consultation time must be at least 1 minute']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Queue', queueSchema);
