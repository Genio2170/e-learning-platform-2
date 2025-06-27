// middleware/auth.js
module.exports = {
  // Verifica se o usuário está autenticado
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    
    // Armazena a URL que o usuário tentou acessar
    req.session.returnTo = req.originalUrl;
    
    req.flash('error_msg', 'Por favor faça login para acessar esta página');
    res.redirect('/auth/login');
  },

  // Verifica o tipo de usuário
  ensureRole: (role) => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === role) {
        return next();
      }
      
      req.flash('error_msg', 'Acesso não autorizado');
      res.redirect('/');
    }
  },

  // Verifica se o perfil está completo
  ensureProfileComplete: (req, res, next) => {
    if (req.isAuthenticated()) {
      // Verifica campos obrigatórios do perfil
      const requiredFields = ['fullName', 'email', 'phone'];
      const isComplete = requiredFields.every(field => req.user[field]);
      
      if (isComplete) {
        return next();
      }
      
      req.flash('info_msg', 'Por favor complete seu perfil antes de continuar');
      return res.redirect('/users/profile/edit');
    }
    next();
  },

  // Redireciona usuários autenticados para suas páginas iniciais
  redirectIfAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      switch (req.user.role) {
        case 'admin':
          return res.redirect('/admin/dashboard');
        case 'teacher':
          return res.redirect('/teachers/dashboard');
        default:
          return res.redirect('/users/dashboard');
      }
    }
    next();
  }
};

// Verificar se usuário é admin
const ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.redirect('/');
};

// Verificar se é estudante
exports.ensureStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') return next();
  res.redirect('/');
};

// Verificar se é professor
exports.ensureTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') return next();
  res.redirect('/');
};


// middleware/auth.js
redirectIfAuthenticated: (req, res, next) => {
  if (req.isAuthenticated()) {
    // Não permitir que usuários logados acessem páginas de autenticação
    if (['/auth/login', '/auth/register', '/auth/forgot-password'].includes(req.path)) {
      return res.redirect('/');
    }
    
    switch (req.user.role) {
      case 'admin':
        return res.redirect('/admin/dashboard');
      case 'teacher':
        return res.redirect('/teachers/dashboard');
      default:
        return res.redirect('/users/dashboard');
    }
  }
  next();
}


exports.checkEmailVerified = (req, res, next) => {
  if (req.path === '/register' && !req.session.emailVerified) {
    return res.redirect('/auth/verify-email?email=' + req.body.email);
  }
  next();
};

exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Por favor faça login primeiro');
  res.redirect('/login');
};

exports.ensureProfileComplete = async (req, res, next) => {
  const requiredFields = ['name', 'email', 'phone', 'address'];
  const user = await User.findById(req.user._id);

  const isComplete = requiredFields.every(field =>
    user[field] && user[field].toString().trim() !== ''
  );

  if (!isComplete && !req.path.includes('/profile')) {
    req.flash('warning', 'Complete seu perfil para continuar');
    return res.redirect('/profile/edit');
  }

  next();
};
