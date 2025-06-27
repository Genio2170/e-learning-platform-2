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

console.log('🔧 Iniciando aplicação...');
console.log(`📊 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 PORT: ${process.env.PORT || 3000}`);

// 1. Inicialização da aplicação (PRIMEIRO)
const app = express();
const server = http.createServer(app);

// 2. Configuração da porta (CRÍTICO para Render)
const PORT = process.env.PORT || 3000;

// 3. Middlewares básicos primeiro (para funcionar mesmo sem dependências opcionais)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

// 4. Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 5. Configurações do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 6. Rota de saúde básica (disponível imediatamente)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// 7. Rota básica para teste
app.get('/', (req, res) => {
  res.json({
    message: 'Plataforma Educacional Online! 🎓',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 8. Função para carregar dependências opcionais
function loadOptionalModule(modulePath, fallback = null) {
  try {
    return require(modulePath);
  } catch (error) {
    console.warn(`⚠️  Módulo opcional não encontrado: ${modulePath}`);
    return fallback;
  }
}

// 9. Carregamento seguro de utils e serviços
const logger = loadOptionalModule('./utils/logger', {
  inject: (req, res, next) => next(),
  stream: { write: () => {} }
});

const { checkEnvVars = () => {} } = loadOptionalModule('./utils/envChecker', {});

// 10. Verificação de variáveis essenciais (com fallbacks)
const requiredVars = ['MONGODB_URI', 'SESSION_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Variáveis de ambiente em falta: ${missingVars.join(', ')}`);
  // Definir fallbacks para desenvolvimento
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/e-learning-platform';
  }
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'dev-secret-key-change-in-production';
  }
}

// 11. Configuração do Socket.IO
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  }
});

// 12. Configuração de sessão (com fallback para MemoryStore)
let sessionStore;
try {
  if (process.env.MONGODB_URI) {
    sessionStore = MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600 // lazy session update
    });
    console.log('✅ MongoDB session store configurado');
  }
} catch (error) {
  console.warn('⚠️  Usando MemoryStore para sessões (não recomendado em produção)');
  sessionStore = undefined; // Express usará MemoryStore por padrão
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 1 dia
    secure: process.env.NODE_ENV === 'production' ? 'auto' : false
  }
}));

// 13. Configuração do Passport (com fallback)
try {
  const passportConfig = loadOptionalModule('./config/passport');
  if (passportConfig && typeof passportConfig === 'function') {
    passportConfig(passport);
  }
  app.use(passport.initialize());
  app.use(passport.session());
  console.log('✅ Passport configurado');
} catch (error) {
  console.warn('⚠️  Passport não configurado:', error.message);
}

// 14. Middlewares opcionais com fallbacks
const middlewares = {
  ensureAuthenticated: loadOptionalModule('./middleware/ensureAuthenticated', (req, res, next) => next()),
  ensureProfileComplete: loadOptionalModule('./middleware/ensureProfileComplete', (req, res, next) => next()),
  errorHandler: loadOptionalModule('./middleware/errorHandler', (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }),
  rateLimiter: loadOptionalModule('./middleware/rateLimiter', (req, res, next) => next()),
  setUserLocals: loadOptionalModule('./middleware/setUserLocals', (req, res, next) => next()),
  setCurrentPage: loadOptionalModule('./middleware/setCurrentPage', (req, res, next) => next()),
  notFoundHandler: loadOptionalModule('./middleware/notFoundHandler', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  })
};

// 15. Aplicar middlewares opcionais
if (process.env.HTTP_LOGGING === 'true') {
  try {
    const morgan = require('morgan');
    app.use(morgan('combined'));
    console.log('✅ Morgan logging ativado');
  } catch (error) {
    console.warn('⚠️  Morgan não disponível');
  }
}

app.use(logger.inject);
app.use(middlewares.rateLimiter);
app.use(middlewares.setUserLocals);
app.use(middlewares.setCurrentPage);

// 16. Disponibilizar io para as rotas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 17. Configuração das rotas (com fallbacks)
const routes = {
  public: loadOptionalModule('./routes/public', express.Router().get('/', (req, res) => res.json({ message: 'Public route working' }))),
  admin: loadOptionalModule('./routes/admin', express.Router().get('/', (req, res) => res.json({ message: 'Admin route working' }))),
  teachers: loadOptionalModule('./routes/teachers', express.Router().get('/', (req, res) => res.json({ message: 'Teachers route working' }))),
  students: loadOptionalModule('./routes/students', express.Router().get('/', (req, res) => res.json({ message: 'Students route working' }))),
  users: loadOptionalModule('./routes/user', express.Router().get('/', (req, res) => res.json({ message: 'Users route working' }))),
  index: loadOptionalModule('./routes/index', express.Router().get('/', (req, res) => res.json({ message: 'Index route working' }))),
  auth: loadOptionalModule('./routes/auth', express.Router().get('/', (req, res) => res.json({ message: 'Auth route working' })))
};

// Aplicar rotas
app.use('/', routes.public);
app.use('/', routes.index);
app.use('/auth', routes.auth);
app.use('/admin', middlewares.ensureAuthenticated, routes.admin);
app.use('/teachers', middlewares.ensureAuthenticated, middlewares.ensureProfileComplete, routes.teachers);
app.use('/students', middlewares.ensureAuthenticated, middlewares.ensureProfileComplete, routes.students);
app.use('/users', middlewares.ensureAuthenticated, routes.users);

// 18. Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Novo cliente conectado:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 Usuário ${userId} entrou na sua sala`);
  });

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// 19. Middlewares de erro (no final)
app.use(middlewares.notFoundHandler);
app.use(middlewares.errorHandler);

// 20. Função de configuração da infraestrutura (assíncrona e opcional)
async function setupInfrastructure() {
  const setupPromises = [];

  // MongoDB
  if (process.env.MONGODB_URI) {
    setupPromises.push(
      mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 50,
        socketTimeoutMS: 30000,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        console.log('✅ MongoDB conectado');
      }).catch(error => {
        console.warn('⚠️  MongoDB não conectado:', error.message);
      })
    );
  }

  // Serviços opcionais
  const optionalServices = [
    { name: 'Firebase', module: './services/firebaseService', method: 'initializeFirebase' },
    { name: 'MessageBroker', module: './services/messageBroker', method: 'setupMessageBroker' },
    { name: 'Monitoring', module: './monitoring/prometheus', method: 'initMonitoring' }
  ];

  for (const service of optionalServices) {
    try {
      const serviceModule = require(service.module);
      if (serviceModule[service.method]) {
        setupPromises.push(
          Promise.resolve(serviceModule[service.method]())
            .then(() => console.log(`✅ ${service.name} inicializado`))
            .catch(error => console.warn(`⚠️  ${service.name} não inicializado:`, error.message))
        );
      }
    } catch (error) {
      console.warn(`⚠️  Serviço ${service.name} não disponível`);
    }
  }

  // Aguardar todos os serviços (mas não falhar se algum não funcionar)
  await Promise.allSettled(setupPromises);
}

// 21. Tratamento de erros globais
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Não encerrar em produção imediatamente
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// 22. Inicialização do servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Tentar configurar infraestrutura (mas não bloquear o servidor)
    setupInfrastructure().catch(error => {
      console.warn('⚠️  Alguns serviços não puderam ser inicializados:', error.message);
    });

    // Iniciar servidor
    const serverInstance = server.listen(PORT, '0.0.0.0', () => {
      console.log('✅ Servidor iniciado com sucesso!');
      console.log(`🌐 Rodando na porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Iniciado em: ${new Date().toISOString()}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Timeout para garantir que o servidor responde
    serverInstance.timeout = 30000;

    return serverInstance;
  } catch (error) {
    console.error('💥 Erro ao iniciar servidor:', error);
    throw error;
  }
}

// 23. Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📡 SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

// 24. Inicializar
startServer().catch(error => {
  console.error('💥 Falha fatal ao iniciar:', error);
  process.exit(1);
});

// Seed do admin apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  try {
    require('./config/adminSeed')();
  } catch (error) {
    console.warn('⚠️  Admin seed não executado:', error.message);
  }
}

module.exports = app;