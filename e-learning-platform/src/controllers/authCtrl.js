const otpService = require('../services/otpService');

exports.loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;
    
    // Lógica de autenticação (usuário pode logar com email ou telefone)
    const user = await User.findOne({
      $or: [
        { email: login },
        { phone: login.replace(/\D/g, '') } // Remove não-dígitos para comparar
      ]
    });

    if (!user) {
      req.flash('error', 'Credenciais inválidas');
      return res.redirect('/auth/login');
    }

    // Verificar senha (usando bcryptjs)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Credenciais inválidas');
      return res.redirect('/auth/login');
    }

    // Redirecionamento inteligente baseado no perfil
    let redirectTo = '/';
    if (user.role === 'admin') redirectTo = '/admin/dashboard';
    else if (user.role === 'teacher') redirectTo = '/teachers/dashboard';
    else if (user.class === 'parent') redirectTo = '/parents/dashboard';

    // Criar sessão
    req.session.user = user;
    res.redirect(redirectTo);

  } catch (err) {
    console.error(err);
    res.redirect('/auth/login');
  }
};


// Rota para solicitar OTP (POST /auth/send-otp)
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    await otpService.generateAndSendOTP(email);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao enviar OTP' });
  }
};

// Rota para verificar OTP (POST /auth/verify-otp)
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await otpService.verifyOTP(email, otp);
    
    if (isValid) {
      // Marcar e-mail como verificado na sessão
      req.session.emailVerified = true;
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Código inválido ou expirado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro na verificação' });
  }
};