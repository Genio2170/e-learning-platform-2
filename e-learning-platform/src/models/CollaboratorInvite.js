const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  email: String,
  token: String, // Para links seguros
  status: { type: String, enum: ['pending', 'accepted', 'rejected'] },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('CollaboratorInvite', inviteSchema);

