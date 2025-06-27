exports.isCourseOwner = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    req.course = course;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};


// Verifica propriedade do curso + status
const isCourseOwner = async (req, res, next) => {
  const course = await Course.findOne({
    _id: req.params.id,
    teacher: req.user.id,
    status: { $ne: 'archived' }
  }).select('+teacher'); // Força incluir campo normalmente excluído

  if (!course) {
    return res.status(403).json({
      error: 'Ação não permitida: curso arquivado ou não pertencente ao usuário'
    });
  }

  req.course = course;
  next();
};

// Verificação hierárquica de permissões
const hasCourseAccess = (roleCheck = 'teacher') => {
  return (req, res, next) => {
    if (roleCheck === 'admin'&& req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso exclusivo para administradores' });
    }

    if (roleCheck === 'teacher'&&
        !['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso exclusivo para professores' });
    }

    next();
  };
};


module.exports = (action) => (req, res, next) => {
  const collaborator = req.course.collaborators.find(
    c => c.userId.equals(req.user._id)
  );

  if (!collaborator?.permissions[action]) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }

  next();
};
