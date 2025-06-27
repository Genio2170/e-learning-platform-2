const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    logger.info('Conectado ao MongoDB com sucesso');
  } catch (err) {
    logger.error('Erro na conexão com MongoDB:', err);
    process.exit(1);
  }
};
    