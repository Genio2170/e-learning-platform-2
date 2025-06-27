const mongoose = require('mongoose');

const flowSchema = new mongoose.Schema({
  steps: [{
    role: String, // 'editor', 'reviewer', 'admin'
    required: Boolean
  }],
  currentStep: Number,
  status: String // 'pending', 'approved', 'rejected'
});

module.exports = mongoose.model('ReviewFlow',flowSchema);
