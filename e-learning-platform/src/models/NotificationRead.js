const mongoose = require('mongoose');

const notificationReadSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  },
  device: String // 'web', 'mobile', 'email'
}, { timestamps: true });

// Índice composto para evitar duplicatas
notificationReadSchema.index({ 
  notificationId: 1, 
  userId: 1 
}, { unique: true });

module.exports = mongoose.model('NotificationRead', notificationReadSchema);