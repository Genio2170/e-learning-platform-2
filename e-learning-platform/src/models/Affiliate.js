const mongoose = require('mongoose');
// models/Affiliate.js
const affiliateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  code: { type: String, required: true, unique: true },
  commissionRate: { type: Number, default: 0.1 }, // 10%
  referredUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }],
  earnings: { type: Number, default: 0 },
  paidOut: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Middleware para criar código único
affiliateSchema.pre('save', function(next) {
  if (!this.code) {
    this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

 module.exports = mongoose.model('Affilate', affiliateSchema);