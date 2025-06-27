// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated, redirectIfAuthenticated } = require('../middleware/auth');

// Página de login
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', {
    loginForm: true,
    error_msg: req.flash('error_msg'),
    info_msg: req.flash('info_msg')
  });
});

// Processar login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error_msg', info.message);
      return res.redirect('/auth/login');
    }
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      
      // Redirecionar conforme o tipo de usuário
      const redirectUrl = req.session.returnTo || 
        (user.role === 'admin' ? '/admin/dashboard' : 
         user.role === 'teacher' ? '/teachers/dashboard' : '/users/dashboard');
      
      delete req.session.returnTo;
      
      req.flash('success_msg', 'Login realizado com sucesso!');
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
});

// Página de registro
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('auth/register', {
    registerForm: true,
    error_msg: req.flash('error_msg')
  });
});

// Processar registro
router.post('/register', async (req, res) => {
  try {
    // Validação dos dados
    const errors = validateRegistration(req.body);
    if (errors.length > 0) {
      req.flash('error_msg', errors);
      return res.redirect('/auth/register');
    }
    
    // Criar usuário
    const newUser = new User({
      ...req.body,
      role: 'student' // Default role
    });
    
    await newUser.save();
    
    // Login automático após registro
    req.logIn(newUser, (err) => {
      if (err) {
        req.flash('error_msg', 'Erro no login automático');
        return res.redirect('/auth/login');
      }
      
      req.flash('success_msg', 'Registro concluído! Complete seu perfil.');
      res.redirect('/users/profile/edit');
    });
    
  } catch (err) {
    req.flash('error_msg', 'Erro no registro: ' + err.message);
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash('success_msg', 'Você foi desconectado');
  res.redirect('/');
});



// routes/auth.js - Adicionar estas novas rotas

// Página de solicitação de recuperação
router.get('/forgot-password', redirectIfAuthenticated, (req, res) => {
  res.render('auth/forgot-password', {
    error_msg: req.flash('error_msg'),
    success_msg: req.flash('success_msg')
  });
});

// Processar solicitação
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body; // Pode ser email ou telefone
    
    // Encontrar usuário por email ou telefone
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });
    
    if (!user) {
      req.flash('error_msg', 'Nenhuma conta encontrada com estas informações');
      return res.redirect('/auth/forgot-password');
    }
    
    // Criar token de recuperação (válido por 1 hora)
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();
    
    // Enviar email/SMS
    await sendPasswordReset(user, token);
    
    req.flash('success_msg', 'Instruções para redefinição enviadas para seu email/telefone');
    res.redirect('/auth/forgot-password');
  } catch (err) {
    req.flash('error_msg', 'Erro ao processar solicitação');
    res.redirect('/auth/forgot-password');
  }
});

// Página de redefinição (acessada via link)
router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Token inválido ou expirado');
      return res.redirect('/auth/forgot-password');
    }
    
    res.render('auth/reset-password', {
      token: req.params.token,
      error_msg: req.flash('error_msg')
    });
  } catch (err) {
    req.flash('error_msg', 'Erro ao validar token');
    res.redirect('/auth/forgot-password');
  }
});

// Processar redefinição
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Token inválido ou expirado');
      return res.redirect('/auth/forgot-password');
    }
    
    // Validar senhas
    if (req.body.password !== req.body.confirmPassword) {
      req.flash('error_msg', 'As senhas não coincidem');
      return res.redirect(`/auth/reset-password/${req.params.token}`);
    }
    
    // Atualizar senha
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Enviar confirmação
    await sendPasswordChangedConfirmation(user);
    
    req.flash('success_msg', 'Senha redefinida com sucesso! Faça login com sua nova senha');
    res.redirect('/auth/login');
  } catch (err) {
    req.flash('error_msg', 'Erro ao redefinir senha');
    res.redirect(`/auth/reset-password/${req.params.token}`);
  }
});


// Nova rota GET para verificação
router.get('/verify-email', (req, res) => {
  res.render('auth/verify-email', { email: req.query.email });
});

// Modificar rota POST /register
router.post('/register', async (req, res) => {
  if (!req.session.emailVerified) {
    return res.redirect('/auth/verify-email?email=' + req.body.email);
  }
  // ... resto da lógica de registro
});


module.exports = router;