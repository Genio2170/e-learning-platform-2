const reviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  comments: [{
    section: String,
    text: String,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  requiredChanges: [String]
}, { timestamps: true });
