module.exports = (role) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    
    req.flash('error_msg', 'Acesso não autorizado');
    res.redirect('/');
  };
};