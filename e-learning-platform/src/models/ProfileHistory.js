const mongoose = require('mongoose');

const profileHistorySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('ProfileHistory', profileHistorySchema);
