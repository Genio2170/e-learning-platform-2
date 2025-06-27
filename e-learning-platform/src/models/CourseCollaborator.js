const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['assistant', 'reviewer', 'editor'],
    default: 'assistant'
  },
  permissions: {
    addLessons: Boolean,
    editContent: Boolean,
    publish: Boolean
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });
module.exports = mongoose.model('CourseCollaboration', collaboratorSchema);