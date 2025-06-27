const { Server } = require('socket.io');
const CourseCollaborator = require('../models/CourseCollaborator');

module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS.split(','),
      methods: ["GET", "POST"]
    }
  });

  // Namespace para colaboração
  const collaborationNS = io.of('/collaboration');

  collaborationNS.on('connection', (socket) => {
    console.log(`New collaboration connection: ${socket.id}`);

    // Entrar na sala do curso
    socket.on('join_course_room', async ({ courseId, userId }) => {
      const isCollaborator = await CourseCollaborator.exists({
        courseId,
        userId,
        status: 'active'
      });

      if (isCollaborator) {
        socket.join(`course_${courseId}`);
        socket.emit('room_joined', { courseId });
      } else {
        socket.emit('error', { message: 'Acesso não autorizado' });
      }
    });

    // Sincronização de edição
    socket.on('content_update', async ({ courseId, section, content }) => {
      // Verificar permissões antes de broadcast
      socket.to(`course_${courseId}`).emit('content_updated', {
        section,
        content,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Histórico de atividades
    socket.on('log_activity', (data) => {
      collaborationNS.to(`course_${data.courseId}`).emit('new_activity', data);
    });
  });

  return io;
};

const setupNotificationNamespace = (io) => {
  const notificationNS = io.of('/notifications');

  notificationNS.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = await verifyToken(token); // Sua função JWT
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Autenticação falhou'));
    }
  });

  notificationNS.on('connection', (socket) => {
    console.log(`New notification connection: ${socket.user._id}`);

    // Entrar nas salas específicas
    socket.join(`user_${socket.user._id}`);
    socket.join(`role_${socket.user.role}`);

    // Marcar notificação como lida
    socket.on('mark_as_read', async (notificationId) => {
      await Notification.updateOne(
        { _id: notificationId, userId: socket.user._id },
        { isRead: true }
      );
    });

    // Solicitar notificações não lidas
    socket.on('get_unread', async () => {
      const unread = await Notification.find({
        userId: socket.user._id,
        isRead: false
      }).sort('-createdAt').limit(20);

      socket.emit('unread_notifications', unread);
    });
  });

  return notificationNS;
};



notificationNS.on('connection', (socket) => {
  socket.on('request_notifications', async () => {
    const unread = await Notification.find({
      userId: socket.user._id,
      isRead: false
    });
    socket.emit('notification_update', unread);
  });
});


io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // Rate limiting por IP
    const ip = socket.handshake.address;
    const key = `ws:rate:${ip}`;
    const count = await redis.incr(key);

    if (count > 100) { // 100 conexões/minuto por IP
      throw new Error('Rate limit exceeded');
    }

    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error(err.message));
  }
});

