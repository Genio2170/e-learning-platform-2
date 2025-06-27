const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  },
  notifications: {
    email: {
      courseUpdates: { type: Boolean, default: true },
      deadlines: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: false }
    },
    muteUntil: Date // Silenciar temporariamente
  }
});

module.exports = mongoose.model('UserPreferences', preferencesSchema);