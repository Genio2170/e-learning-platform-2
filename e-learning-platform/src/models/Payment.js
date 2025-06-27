// models/Payment.js
const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['transfer', 'deposit', 'other'], required: true },
  proof: { type: String, required: true }, // URL do comprovante
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminFeedback: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Payment', paymentSchema);