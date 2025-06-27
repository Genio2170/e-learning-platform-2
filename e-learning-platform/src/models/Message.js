// models/Message.js
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
   from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);