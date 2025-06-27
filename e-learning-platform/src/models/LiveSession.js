const mongoose = require('mongoose');
const liveSessionSchema = new mongoose.Schema({
  title: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  date: Date,
  duration: Number, // em minutos
  zoomLink: String,
  recording: String // URL da gravação
});

module.exports = mongoose.model('LiveSession', liveSessionSchema);