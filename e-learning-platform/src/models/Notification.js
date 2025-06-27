const mongoose = require('mongoose');
// models/Notification.js
const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     type: { 
    type: String, 
    enum: [
      // Aluno
'course_update', 'assignment_deadline', 'grade_posted',
      // Professor
'new_assignment_submission', 'course_approved', 'student_question',
      // Admin
'system_alert', 'moderation_required', 'payment_issue',
      // Sistema
'maintenance', 'broadcast'
    ] 
  },

  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['system', 'course', 'live', 'message'], default: 'system' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },

  relatedEntity: { type: mongoose.Schema.Types.ObjectId }, // ID do curso, aula, e
  createdAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['payment', 'course', 'system'] },
   priority: { type: Number, default: 1 } // 1-5 (5 = urgente)
}
, { timestamps: true });


// Método para enviar notificação
notificationSchema.statics.createAndSend = async function(userId, title, message, type, relatedEntity, io) {
  const notification = new this({
    user: userId,
    title,
    message,
    type,
    relatedEntity
  });
  
  await notification.save();
  
  // Envia via Socket.io se o usuário estiver online
  if (io) {
    io.to(`user-${userId}`).emit('new-notification', notification);
  }
  
  return notification;
};

// Índices para consultas rápidas
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });


module.exports = mongoose.model('Notification', notificationSchema);