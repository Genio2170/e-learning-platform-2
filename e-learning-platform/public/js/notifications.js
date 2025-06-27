class NotificationManager {
  constructor(userId, userRole) {
    this.userId = userId;
    this.userRole = userRole;
    this.socket = io('/notifications', { auth: { token: localStorage.getItem('jwt') } });
    this.init();
  }

  init() {
    this.setupSocket();
    this.loadNotifications();
    this.setupEventListeners();
  }

  setupSocket() {
    this.socket.on('new_notification', (notification) => {
      this.addNotificationToUI(notification);
      this.updateUnreadCount();
      this.playSound();
    });

    this.socket.on('unread_notifications', (notifications) => {
      this.renderNotifications(notifications);
      this.updateUnreadCount();
    });
  }

  async loadNotifications(filter = 'all') {
    const res = await fetch(`/api/notifications?filter=${filter}`);
    const notifications = await res.json();
    this.renderNotifications(notifications);
  }

  renderNotifications(notifications) {
    const template = document.getElementById('notification-template').innerHTML;
    const list = document.getElementById('notifications-list');

    list.innerHTML = notifications.map(notif => {
      return ejs.render(template, { ...notif, userRole: this.userRole });
    }).join('');
  }

  addNotificationToUI(notification) {
    const template = document.getElementById('notification-template').innerHTML;
    const list = document.getElementById('notifications-list');
    list.insertAdjacentHTML('afterbegin', ejs.render(template, notification));
  }

  setupEventListeners() {
    // Marcar como lida
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('mark-read-btn')) {
        const item = e.target.closest('.notification-item');
        this.markAsRead(item.dataset.id);
        item.classList.replace('unread', 'read');
        e.target.remove();
      }
    });

    // Filtros
    document.getElementById('notification-filter').addEventListener('change', (e) => {
      this.loadNotifications(e.target.value);
    });

    // Marcar todas como lidas
    document.getElementById('mark-all-read').addEventListener('click', () => {
      fetch('/api/notifications/mark-all-read', { method: 'POST' });
      document.querySelectorAll('.unread').forEach(item => {
        item.classList.replace('unread', 'read');
      });
    });
  }

  async markAsRead(notificationId) {
    await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
    this.socket.emit('mark_as_read', notificationId);
  }

  updateUnreadCount() {
    const count = document.querySelectorAll('.unread').length;
    document.querySelectorAll('.notification-badge').forEach(badge => {
      badge.textContent = count > 0 ? count : '';
    });
  }

  playSound() {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play();
  }
}

document.addEventListener('click', (e) => {
  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn) {
    const action = actionBtn.dataset.action;
    const notificationId = actionBtn.closest('.notification-item').dataset.id;

    switch(action) {
      case 'grade-submission':
        window.location.href = `/grade-submission/${actionBtn.dataset.submissionId}`;
        break;
      case 'join-course':
        fetch(`/courses/${actionBtn.dataset.courseId}/join`, { method: 'POST' });
        break;
    }

    this.markAsRead(notificationId);
  }
});

class NotificationPagination {
  constructor() {
    this.page = 1;
    this.hasMore = true;
    this.loading = false;
    this.observer = new IntersectionObserver(this.loadMore.bind(this), {
      root: document.querySelector('.notifications-list'),
      threshold: 0.1
    });
  }

  init() {
    const sentinel = document.createElement('div');
    sentinel.id = 'notification-sentinel';
    document.querySelector('.notifications-list').appendChild(sentinel);
    this.observer.observe(sentinel);
  }

  async loadMore(entries) {
    if (this.loading || !this.hasMore) return;

    if (entries[0].isIntersecting) {
      this.loading = true;
      this.page++;

      const res = await fetch(`/api/notifications?page=${this.page}`);
      const newNotifications = await res.json();

      if (newNotifications.length < 20) {
        this.hasMore = false;
      }

      this.renderNotifications(newNotifications);
      this.loading = false;
    }
  }
}
