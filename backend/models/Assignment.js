const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    courseId: { type: String, trim: true, maxlength: 50 },
    dueAt: { type: Date },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'submitted', 'graded'],
      default: 'todo',
      index: true,
    },
    // optional: same priority scale as tasks/events
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

assignmentSchema.index({ userId: 1, dueAt: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
