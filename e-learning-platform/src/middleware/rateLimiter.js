const rateLimit = require('express-rate-limit');

const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // limite de 50 requisições
  message: 'Muitas requisições desta conta, tente novamente mais tarde',
  skip: req => req.user?.role === 'admin' // Admins não tem limite
});

module.exports = { postLimiter };
