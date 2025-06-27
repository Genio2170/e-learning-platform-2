const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

// Configurações de ambiente
require('dotenv').config();

// Utils e serviços
const logger = require('./utils/logger');
const { checkEnvVars } = require('./utils/envChecker');
const { initializeFirebase } = require('./services/firebaseService');
const { setupMessageBroker } = require('./services/messageBroker');
const { startDLQWorker } = require('./workers/dlqWorker');
const { initMonitoring } = require('./monitoring/prometheus');

// Middlewares
const ensureAuthenticated = require('./middleware/ensureAuthenticated');
const ensureProfileComplete = require('./middleware/ensureProfileComplete');
const errorHandler = require('./middleware/errorHandler');
const {
  rateLimiter,
  setUserLocals,
  setCurrentPage,
  notFoundHandler
} = require('./middleware');

// Configuração Passport
require('./config/passport')(passport);

// Rotas
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const userRoutes = require('./routes/user');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');

// 1. Verificação inicial de variáveis de ambiente
checkEnvVars(['mongodb://localhost:27017/e-learning-platform', 'redis://user:pass@redis-server:6379', '"project_id": "educahome-3dacd" private_key_id": "58e0233577b5f9e67e45da222d19dd0bc1135aae" 553534478606', 'S3ss10N_Secr3t@2024*%#Ks8DjaLk9Vx']);

// 2. Inicialização da aplicação
const app = express();
const server = http.createServer(app);

// 3. Configuração do Socket.IO
const io = socketio(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

// Instrumentação do Socket.IO Admin UI (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  const { instrument } = require('@socket.io/admin-ui');
  instrument(io, {
    auth: false,
    mode: "development"
  });
}

// 4. Configuração da infraestrutura
async function setupInfrastructure() {
  try {
    // Database
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 50,
      socketTimeoutMS: 30000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB conectado');

    // Redis (Para PubSub e Cache)
    await setupMessageBroker();

    // Firebase
    await initializeFirebase();

    // Monitoramento
    initMonitoring();

    // Backup (se habilitado)
    if (process.env.ENABLE_BACKUPS === 'true') {
      require('./services/backupService').setupBackups();
    }

    // DLQ Worker
    startDLQWorker();

  } catch (error) {
    console.error('Erro na configuração da infraestrutura:', error);
    process.exit(1);
  }
}

// 5. Configurações do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 6. Middlewares globais
// Logging de requests HTTP
if (process.env.HTTP_LOGGING === 'true') {
  const morgan = require('morgan');
  app.use(morgan('combined', { stream: logger.stream }));
}

// Injetar logger em todas as rotas
app.use(logger.inject);

// Middlewares de segurança e rate limiting
app.use(require('./middleware/securityHeaders'));
app.use(rateLimiter);
app.use(require('./middleware/notificationMetrics'));

// Parsing de requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors);

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 7. Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 dia
}));

// 8. Configuração do Passport
app.use(passport.initialize());
app.use(passport.session());

// 9. Internacionalização
const i18n = require('./config/i18n');
app.use(i18n.init);

// 10. Middlewares customizados
app.use(setUserLocals);
app.use(setCurrentPage);

// Disponibilizar io para as rotas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 11. Cache middleware para cursos
app.use('/courses/:id', async (req, res, next) => {
  try {
    const cacheService = require('./services/cacheService');
    const course = await cacheService.getCourse(req.params.id);
    res.locals.preloadedData = {
      course,
      teacher: await cacheService.get(`user:${course.teacherId}`)
    };
  } catch (error) {
    console.error('Erro no cache middleware:', error);
  }
  next();
});

// 12. Configuração das rotas
// Rotas públicas
app.use('/', publicRoutes);
app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// Rotas protegidas
app.use('/admin', 
  ensureAuthenticated, 
  require('./middleware/ensureRole')('admin'), 
  adminRoutes
);

app.use('/teachers', 
  ensureAuthenticated, 
  ensureProfileComplete, 
  teacherRoutes
);

app.use('/students', 
  ensureAuthenticated, 
  ensureProfileComplete, 
  studentRoutes
);

app.use('/users', ensureAuthenticated, userRoutes);

// Rotas de API
app.use('/api', require('./routes'));

// Métricas
app.use('/metrics', require('./routes/metrics'));

// 13. Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'UP' : 'DOWN',
    redis: io.redis && io.redis.status === 'ready' ? 'UP' : 'DOWN'
  });
});

// 14. Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Junta o usuário à sua sala pessoal
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Usuário ${userId} entrou na sua sala`);
  });

  // Salas de aula
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
  });

  // Sistema de mensagens
  socket.on('joinStudentRoom', (userId) => {
    socket.join(`student_${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const Message = require('./models/Message');
      const message = new Message(data);
      await message.save();

      io.to(`student_${data.to}`).emit('newMessage', message);
      io.to(`teacher_${data.from}`).emit('newMessage', message);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  });

  // Notificações
  socket.on('mark-as-read', (notificationId) => {
    // Implementar lógica para marcar notificação como lida
  });

  // Admin dashboard
  socket.on('admin-dashboard', () => {
    const statsInterval = setInterval(async () => {
      try {
        const getRealTimeStats = require('./services/monitoringService').getRealTimeStats;
        const stats = await getRealTimeStats();
        socket.emit('stats-update', stats);
      } catch (error) {
        console.error('Erro ao obter stats:', error);
        clearInterval(statsInterval);
      }
    }, 5000);

    socket.on('disconnect', () => {
      clearInterval(statsInterval);
    });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// 15. Stats do sistema (broadcast)
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      const stats = await require('./services/monitoringService').getSystemStats();
      io.emit('system-stats', stats);
    } catch (error) {
      console.error('Erro ao broadcast stats:', error);
    }
  }, 5000);
}

// 16. Middlewares de erro (devem vir por último)
app.use(notFoundHandler);
app.use(errorHandler);

// 17. Tratamento de erros globais
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// 18. Inicialização do servidor
async function startServer() {
  try {
    await setupInfrastructure();

    const PORT = process.env.PORT || 3000
    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando com WebSockets na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Inicializar seed do admin (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  require('./config/adminSeed')();
}

// Iniciar o servidor
startServer();

module.exports = app;
