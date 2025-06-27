const winston = require('winston');
const { LokiTransport } = require('winston-loki');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const { format, transports } = winston;
const path = require('path');

// 1. Configuração de níveis personalizados
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  http: 5
};

// 2. Formato personalizado para desenvolvimento
const devFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.colorize(),
  format.printf(
    (info) => `${info.timestamp} [${info.level}] ${info.message} ${info.stack || ''}`
  )
);

// 3. Formato para produção (JSON estruturado)
const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

// 4. Transportes dinâmicos baseados no ambiente
function getTransports() {
  const _transports = [
    new transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      level: 'info'
    }),
    new transports.File({
      filename: path.join(__dirname, '../../logs/errors.log'),
      level: 'error',
      handleExceptions: true
    })
  ];

  if (process.env.NODE_ENV !== 'production') {
    _transports.push(new transports.Console({
      format: devFormat,
      level: 'debug'
    }));
  } else {
    // Adiciona transportes para produção
    if (process.env.LOKI_URL) {
      _transports.push(new LokiTransport({
        host: process.env.LOKI_URL,
        labels: { app: 'e-learning-platform' },
        json: true,
        format: prodFormat,
        level: 'info'
      }));
    }

    if (process.env.ELASTICSEARCH_URL) {
      _transports.push(new ElasticsearchTransport({
        level: 'info',
        clientOpts: { node: process.env.ELASTICSEARCH_URL }
      }));
    }
  }

  return _transports;
}

// 5. Criação do logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: prodFormat,
  transports: getTransports(),
  exitOnError: false
});

// 6. Stream para morgan (HTTP logging)
logger.stream = {
  write: (message) => logger.http(message.trim())
};

// 7. Middleware para injetar logger no Express
logger.inject = (req, res, next) => {
  req.logger = logger;
  next();
};

module.exports = logger;
