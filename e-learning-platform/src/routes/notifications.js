const router = require('express').Router();
const notificationCtrl = require('../controllers/notificationController');

// Rotas comuns
router.get('/', notificationCtrl.getNotifications);
router.post('/:id/read', notificationCtrl.markAsRead);
router.post('/mark-all-read', notificationCtrl.markAllAsRead);

// Rotas específicas para admin
router.get('/admin/stats', notificationCtrl.getNotificationStats);
router.delete('/admin/:id', notificationCtrl.deleteNotification);

module.exports = router;
