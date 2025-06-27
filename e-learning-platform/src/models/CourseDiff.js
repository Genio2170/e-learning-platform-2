const mongoose = require('mongoose');

// Adicionar ao schema de versionamento
const diffSchema = new mongoose.Schema({
  versionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseVersion' },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseDiff', diffSchema);
