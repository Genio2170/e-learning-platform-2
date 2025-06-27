module.exports = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
};
