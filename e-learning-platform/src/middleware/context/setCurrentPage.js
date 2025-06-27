module.exports = (req, res, next) => {
  res.locals.currentPage = req.path.split('/')[1] || 'home';
  next();
};
