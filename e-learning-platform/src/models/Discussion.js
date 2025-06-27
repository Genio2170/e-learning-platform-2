const mongoose = require('mongoose');
// models/Discussion.js
const discussionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  tags: [{ type: String }],
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

 module.exports = mongoose.model('Discussion', discussionSchema);