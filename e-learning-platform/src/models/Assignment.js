const mongoose = require('mongoose');
// models/Assignment.js
const assignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  maxScore: { type: Number, required: true },
  resources: [{ type: String }], // URLs de arquivos
  createdAt: { type: Date, default: Date.now }
});

 module.exports = mongoose.model('Assignment', assignmentSchema);