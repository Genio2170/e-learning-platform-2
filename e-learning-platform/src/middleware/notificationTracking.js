module.exports = async (req, res, next) => {
  if (req.method === 'POST'&& req.path.includes('/read')) {
    const notificationId = req.params.id;
    const userId = req.user._id;

    await NotificationRead.create({
      notificationId,
      userId,
      device: req.device.type // Usar library como 'express-device'
    });

    // Auditoria
    await AuditLog.create({
      action: 'notification_read',
      entityId: notificationId,
      userId,
      metadata: { ip: req.ip }
    });
  }
  next();
};
