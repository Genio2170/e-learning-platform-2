const mongoose = require('mongoose');
// models/CourseProgress.js
const courseProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course.lessons' }],
  lastAccessed: { type: Date, default: Date.now },
  progressPercentage: { type: Number, default: 0 },
  notes: [{
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Course.lessons' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
});

// Método para atualizar progresso
courseProgressSchema.methods.updateProgress = function(lessonId) {
  if (!this.completedLessons.includes(lessonId)) {
    this.completedLessons.push(lessonId);
  }
  
  const totalLessons = this.course.lessons.length;
  this.progressPercentage = Math.round((this.completedLessons.length / totalLessons) * 100);
  this.lastAccessed = new Date();
  
  return this.save();
};

 module.exports = mongoose.model('CourseProgress', courseProgressSchema);