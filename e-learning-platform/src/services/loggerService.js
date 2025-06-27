class NotificationService {
  constructor(logger) {
    this.logger = logger;
  }

  async sendNotification(data) {
    this.logger.debug('Enviando notificação', { userId: data.userId });

    try {
      // Lógica de envio...
      this.logger.info('Notificação enviada', { 
        type: data.type,
        status: 'delivered'
      });
    } catch (err) {
      this.logger.error('Falha no envio', {
        error: err.message,
        metadata: data.metadata
      });
      throw err;
    }
  }
}
