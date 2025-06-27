const client = require('prom-client');

const metrics = {
  deliveryAttempts: new client.Counter({
    name: 'notifications_delivery_attempts_total',
    help: 'Total de tentativas de entrega',
    labelNames: ['type', 'platform']
  }),
  deliveryLatency: new client.Histogram({
    name: 'notifications_delivery_latency_seconds',
    help: 'Latência do delivery de notificações',
    buckets: [0.1, 0.5, 1, 2, 5]
  })
};

function trackDelivery(startTime, notification) {
  const latency = (Date.now() - startTime) / 1000;

  metrics.deliveryAttempts.inc({
    type: notification.type,
    platform: notification.platform
  });

  metrics.deliveryLatency.observe(latency);
}
