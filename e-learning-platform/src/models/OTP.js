const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expira em 5 minutos (300 segundos)
  }
});

module.exports = mongoose.model('OTP', otpSchema);