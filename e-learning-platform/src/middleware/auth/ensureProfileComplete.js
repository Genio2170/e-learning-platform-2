module.exports = (req, res, next) => {
  const user = req.user;
  const requiredFields = ['name', 'email', 'phone', 'address'];

  const isComplete = requiredFields.every(field =>
    user[field] && user[field].toString().trim() !== ''
  );

  if (!isComplete && !req.path.includes('/profile')) {
    return res.redirect('/profile/edit?warning=complete-profile');
  }

  next();
};
