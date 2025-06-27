const mongoose = require('mongoose');
// models/Achievement.js
const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  criteria: {
    type: { 
      type: String, 
      enum: ['coursesCompleted', 'lessonsCompleted', 'streakDays', 'assignmentsSubmitted'], 
      required: true 
    },
    threshold: { type: Number, required: true }
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);