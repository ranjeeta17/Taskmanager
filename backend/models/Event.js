const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['lecture', 'exam', 'meeting', 'assignment', 'other'],
      default: 'other',
    },
    startAt: { type: Date, required: [true, 'Start date is required'] },
    endAt: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator(value) {
          return this.startAt < value;
        },
        message: 'End date must be after start date',
      },
    },
    courseId: { type: String, required: [true, 'Course ID is required'], trim: true, maxlength: 50 },
    notes: { type: String, trim: true, maxlength: 500 },
    location: { type: String, trim: true, maxlength: 100 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' },
      interval: { type: Number, default: 1 },
      endDate: {
        type: Date,
        validate: {
          validator(value) {
            return !this.isRecurring || (value && value > this.startAt);
          },
          message: 'Recurrence end date must be after start date',
        },
      },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

eventSchema.index({ userId: 1, startAt: 1 });

module.exports = mongoose.model('Event', eventSchema);
