const logger = require('./src/utils/logger');

module.exports = {
  database: {
    // configs...
    onConnect: () => logger.info('Database connected'),
    onError: (err) => logger.error('DB connection error', err)
  }
};
