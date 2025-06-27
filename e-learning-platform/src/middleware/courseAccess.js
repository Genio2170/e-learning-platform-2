module.exports = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;
    
    const [course, user] = await Promise.all([
      Course.findById(courseId).select('studentsEnrolled'),
      User.findById(userId).select('coursesEnrolled')
    ]);
    
    const hasAccess = user.coursesEnrolled.includes(courseId) || 
                     (req.user.role === 'admin') ||
                     (req.user.role === 'teacher' && course.teacher.equals(userId));
    
    if (!hasAccess) {
      req.flash('error_msg', 'Você não tem acesso a este conteúdo');
      return res.redirect(`/courses/${courseId}`);
    }
    
    next();
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/500');
  }
};
