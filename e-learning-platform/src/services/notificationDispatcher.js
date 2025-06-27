class NotificationDispatcher {
  constructor() {
    this.topics = {
'course.updates': [],
'system.alerts': []
    };
  }

  subscribe(topic, handler) {
    this.topics[topic].push(handler);
  }

  async publish(topic, data) {
    for (const handler of this.topics[topic]) {
      await handler(data);
    }
  }
}

// Uso:
dispatcher.subscribe('course.updates', async (data) => {
  if (await shouldNotifyUser(data.userId, 'course_update')) {
    await sendNotification(data.userId, data.message);
  }
});


class NotificationDispatcher {
  constructor() {
    this.retryPolicy = {
      maxRetries: 3,
      backoffFactor: 2, // Exponencial
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
    };
  }

  async sendWithRetry(notification) {
    let attempt = 0;

    while (attempt < this.retryPolicy.maxRetries) {
      try {
        return await this._sendNotification(notification);
      } catch (err) {
        if (!this.retryPolicy.retryableErrors.includes(err.code)) {
          throw err;
        }

        attempt++;
        const delay = 1000 * Math.pow(this.retryPolicy.backoffFactor, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    await this._sendToDLQ(notification);
  }

  async _sendToDLQ(notification) {
    await redis.rpush(
'dlq:notifications',
      JSON.stringify({
        ...notification,
        failedAt: new Date(),
        reason: 'Max retries exceeded'
      })
    );
  }
}
