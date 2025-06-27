const verifyDefaultAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id);

    if (admin.isDefaultAdmin && req.originalUrl.includes('/security-settings')) {
      return res.status(403).render('errors/403', { 
        message: 'Acesso restrito para a conta padrão'
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = verifyDefaultAdmin;
