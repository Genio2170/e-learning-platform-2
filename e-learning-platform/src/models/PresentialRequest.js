// models/PresentialRequest.js
const mongoose = require('mongoose');
const presentialRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  preferredDate: { type: Date },
  preferredLocation: { type: String },
    subject: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }, // em minutos
  location: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminFeedback: { type: String },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  proof: String // Comprovativo de pagamento
}, { timestamps: true });

module.exports = mongoose.model('PresentialRequest',presentialRequestSchema);