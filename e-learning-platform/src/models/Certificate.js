const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issueDate: { type: Date, default: Date.now },
  certificateUrl: { type: String, required: true },
  verificationCode: { type: String, required: true, unique: true }
});     

 module.exports = mongoose.model('Certificate', certificateSchema);
