// services/notificationService.js
const admin = require('firebase-admin');
const User = require('../models/User');

admin.initializeApp({
  credential: admin.credential.cert(require('../config/firebase-service-account.json'))
});

module.exports = {
  sendPushNotification: async (userId, title, body, data = {}) => {
    try {
      const user = await User.findById(userId).select('fcmToken');
      if (!user || !user.fcmToken) return;
      
      const message = {
        notification: { title, body },
        data,
        token: user.fcmToken
      };
      
      await admin.messaging().send(message);
    } catch (err) {
      console.error('Erro ao enviar notificação push:', err);
    }
  }
};

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  async sendUserNotification(userId, notificationData) {
    const notification = await Notification.create({
      userId,
      ...notificationData
    });

    // Envia via WebSocket se o usuário estiver conectado
    this.io.to(`user_${userId}`).emit('new_notification', notification);

    return notification;
  }

  async sendRoleNotification(role, notificationData) {
    const users = await User.find({ role });
    const notifications = await Notification.insertMany(
      users.map(user => ({
        userId: user._id,
        ...notificationData
      }))
    );

    // Broadcast para todos os usuários com a role
    this.io.to(`role_${role}`).emit('new_notification', notificationData);

    return notifications;
  }

  async sendSystemNotification(notificationData) {
    // Notificação global (ex: manutenção)
    this.io.emit('system_notification', notificationData);
    return await Notification.create({
      userId: null, // Indica notificação do sistema
      ...notificationData
    });
  }
}

   // Em services/notificationService.js
   const priorityQueue = {
     5: [], // Urgente
     3: [], // Normal
     1: []  // Baixa
   };


   async function shouldNotifyUser(userId, notificationType) {
  const prefs = await UserPreferences.findOne({ userId });

  if (!prefs) return true;
  if (prefs.notifications.muteUntil > new Date()) return false;

  // Lógica específica por tipo
  switch(notificationType) {
    case 'course_update':
      return prefs.notifications.email.courseUpdates;
    case 'assignment_deadline':
      return prefs.notifications.email.deadlines;
    default:
      return prefs.notifications.push.enabled;
  }
}

broker.subscribe('course.updates', async (event) => {
  const students = await getCourseSubscribers(event.courseId);

  students.forEach(async (student) => {
    if (await shouldNotify(student._id, 'course_update')) {
      await sendNotification({
        userId: student._id,
        type: 'course_update',
        title: `Curso ${event.course.name} atualizado`,
        metadata: { courseId: event.courseId }
      });
    }
  });
});

