const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
     admin: {     type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },

       action: {
    type: String,
    required: true,
    enum: ['login', 'user_modified', 'content_approved', 'settings_changed']
  },
  target: {
    type: String,
    required: false
  },
     targetId: mongoose.Schema.Types.ObjectId,
      ipAddress: String,
  userAgent: String,

     metadata: Object
   }, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);
