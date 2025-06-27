const mongoose = require('mongoose');
const testimonialSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  content: { type: String, required: true, maxlength: 500 },
  rating: { type: Number, min: 1, max: 5, required: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
