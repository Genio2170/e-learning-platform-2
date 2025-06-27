const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  year: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  isMilestone: { type: Boolean, default: false }
});

 module.exports = mongoose.model('CompanyHistory', historySchema);