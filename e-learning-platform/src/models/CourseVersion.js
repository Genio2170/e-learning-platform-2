const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  data: { type: mongoose.Schema.Types.Mixed }, // Snapshots completos
  changedFields: [String], // Campos alterados
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index composto para busca eficiente
versionSchema.index({ courseId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model('CourseVersion', versionSchema);
