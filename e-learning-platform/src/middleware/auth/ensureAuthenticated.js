module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  req.session.returnTo = req.originalUrl;
  req.flash('error_msg', 'Por favor faça login para acessar esta página');
  res.redirect('/auth/login');
};



