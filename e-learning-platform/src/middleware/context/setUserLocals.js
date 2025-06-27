module.exports = (req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
};