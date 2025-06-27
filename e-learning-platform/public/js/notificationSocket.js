class NotificationSocket {
  constructor(token) {
    this.socket = io('/notifications', {
      auth: { token }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on('new_notification', (notification) => {
      this.showToast(notification);
      this.updateBadgeCount();
    });

    this.socket.on('system_notification', (notification) => {
      showSystemAlert(notification);
    });
  }

  markAsRead(notificationId) {
    this.socket.emit('mark_as_read', notificationId);
  }

  requestUnread() {
    this.socket.emit('get_unread');
  }
}
