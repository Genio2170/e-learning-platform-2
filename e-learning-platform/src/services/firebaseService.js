const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

class FirebaseNotification {
  async sendPushNotification(deviceTokens, notification, data = {}) {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      tokens: deviceTokens
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        results: response.responses
      };
    } catch (err) {
      console.error('FCM Error:', err);
      throw err;
    }
  }
}

// Exemplo de uso:
const fcm = new FirebaseNotification();
await fcm.sendPushNotification(
  ['device_token_1', 'device_token_2'],
  {
    title: 'Novo material disponível',
    body: 'O curso de JavaScript foi atualizado'
  },
  {
    courseId: '123',
    type: 'course_update'
  }
);
