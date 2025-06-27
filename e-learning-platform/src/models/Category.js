const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  subcategories: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

 module.exports = mongoose.model('Category', categorySchema);