const checkPasswordExpiration = async (req, res, next) => {
  if (req.user?.role === 'admin') {
    const lastChanged = req.user.passwordChangedAt || req.user.createdAt;
    const daysSinceChange = (Date.now() - lastChanged) / (1000 * 60 * 60 * 24);

    if (daysSinceChange > 90) {
      return res.redirect('/admin/change-password?expired=true');
    }
  }
  next();
};
