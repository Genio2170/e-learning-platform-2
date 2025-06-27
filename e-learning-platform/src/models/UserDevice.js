const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web'],
    required: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Remover tokens duplicados
deviceSchema.index({ userId: 1, token: 1 }, { unique: true });


module.exports = mongoose.model('UserDevice', deviceSchema);