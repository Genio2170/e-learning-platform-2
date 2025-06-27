// models/Review.js
const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

// Método para atualizar a avaliação média do curso
reviewSchema.post('save', async function() {
  const Course = require('./Course');
  const reviews = await this.model('Review').find({ course: this.course });
  const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
  
  await Course.findByIdAndUpdate(this.course, { 
    averageRating: parseFloat(avgRating.toFixed(1)),
    reviewsCount: reviews.length
  });
});

module.exports = mongoose.model('Review',reviewSchema);