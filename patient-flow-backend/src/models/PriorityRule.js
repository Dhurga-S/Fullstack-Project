const mongoose = require('mongoose');

const priorityRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true
    },
    triageLevel: {
      type: String,
      required: [true, 'Triage level is required'],
      enum: {
        values: ['EMERGENCY', 'URGENT', 'NORMAL'],
        message: '{VALUE} is not a valid triage level'
      }
    },
    priority: {
      type: Number,
      required: [true, 'Priority value is required'],
      enum: {
        values: [1, 2, 3],
        message: 'Priority must be 1, 2, or 3'
      }
    },
    description: {
      type: String,
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PriorityRule', priorityRuleSchema);
