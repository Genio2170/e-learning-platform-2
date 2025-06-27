module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect(
      req.user.role === 'admin' ? '/admin' : 
      req.user.role === 'teacher' ? '/teachers' : '/'
    );
  }
  next();
};
