const Redis = require('ioredis');

class PubSub {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.subscribers = new Map();
  }

  async subscribe(topic, callback) {
    const subCount = this.subscribers.get(topic)?.length || 0;

    if (subCount === 0) {
      await this.redis.subscribe(topic);
    }

    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }

    this.subscribers.get(topic).push(callback);
  }

  async publish(topic, message) {
    await this.redis.publish(topic, JSON.stringify(message));
  }

  init() {
    this.redis.on('message', (topic, message) => {
      const callbacks = this.subscribers.get(topic) || [];
      callbacks.forEach(cb => cb(JSON.parse(message)));
    });
  }
}

// Uso:
const broker = new PubSub();
broker.init();

// Subscrever
broker.subscribe('course.updates', (data) => {
  console.log('Novo evento:', data);
});

// Publicar
broker.publish('course.updates', {
  courseId: '123',
  action: 'material_added'
});
