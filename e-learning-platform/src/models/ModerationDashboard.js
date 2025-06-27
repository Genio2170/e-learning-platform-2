const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  pendingReviews: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    submittedAt: Date,
    priority: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  reviewersActivity: [{
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastActivity: Date,
    openReviews: Number
  }],
  stats: {
    avgReviewTime: Number,
    rejectionRate: Number
  }	
}, { timestamps: true });

module.exports = mongoose.model('ModerationDashboard', dashboardSchema);