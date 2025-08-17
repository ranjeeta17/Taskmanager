const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['lecture', 'exam', 'meeting', 'assignment', 'other'],
    default: 'other',
  },
  startAt: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endAt: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function (value) {
        return this.startAt < value;
      },
      message: 'End date must be after start date',
    },
  },
  courseId: {
    type: String,
    required: [true, 'Course ID is required'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'none'],
      default: 'none',
    },
    interval: {
      type: Number,
      default: 1,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !this.isRecurring || (value && value > this.startAt);
        },
        message: 'Recurrence end date must be after start date',
      },
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

eventSchema.index({ userId: 1, startAt: 1 });

module.exports = mongoose.model('Event', eventSchema);