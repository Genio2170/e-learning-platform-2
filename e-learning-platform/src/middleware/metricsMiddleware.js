const client = require('prom-client');
const responseTime = require('response-time');

// Criar métricas
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [50, 100, 200, 500, 1000, 5000]
});

module.exports = responseTime((req, res, time) => {
  httpRequestDuration
    .labels(req.method, req.route.path, res.statusCode)
    .observe(time);
});


const notificationMetrics = new client.Counter({
  name: 'notifications_sent_total',
  help: 'Total de notificações enviadas',
  labelNames: ['type', 'role']
});

// No NotificationService
notificationMetrics.inc({
  type: notificationData.type,
  role: user?.role || 'system'
});
