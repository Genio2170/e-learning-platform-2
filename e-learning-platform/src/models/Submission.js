// models/Submission.js
const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{ type: String }], // URLs de arquivos enviados
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number },
  feedback: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date }
});


module.exports = mongoose.model('Submission',submissionSchema);