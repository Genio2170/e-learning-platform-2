const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const speakeasy = require('speakeasy');

exports.resetDefaultAdminPassword = async (req, res) => {
  try {
    const admin = await User.findOne({ isDefaultAdmin: true });

    if (!admin) {
      return res.status(404).json({ error: 'Admin padrão não encontrado' });
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    admin.password = await bcrypt.hash(tempPassword, 12);
    await admin.save();

    await sendEmail({
      to: admin.email,
      subject: 'Senha Temporária - Admin Padrão',
      html: `<p>Sua nova senha temporária: <strong>${tempPassword}</strong></p>`
    });

    res.json({ 
      success: true,
      message: 'Nova senha enviada por email'
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Erro ao resetar senha'
    });
  }
};


exports.setup2FA = async (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 });

  await User.findByIdAndUpdate(req.user._id, {
'twoFactorAuth.secret': secret.base32,
'twoFactorAuth.backupCodes': Array(5).fill()
      .map(() => crypto.randomBytes(4).toString('hex'))
  });

  res.json({
    qrCodeUrl: `otpauth://totp/Admin:${req.user.email}?secret=${secret.base32}&issuer=Plataforma`,
    backupCodes: req.user.twoFactorAuth.backupCodes
  });
};

exports.verify2FA = async (req, res) => {
  const verified = speakeasy.totp.verify({
    secret: req.user.twoFactorAuth.secret,
    encoding: 'base32',
    token: req.body.token
  });

  if (verified) {
    req.session.twoFactorVerified = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Código inválido' });
  }
};


exports.requestAccountRecovery = async (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hora

  await User.findByIdAndUpdate(req.user._id, {
    accountRecovery: { token, expires }
  });

  await sendEmail({
    to: req.user.email,
    subject: 'Recuperação de Conta Admin',
    html: `<a href="${process.env.DOMAIN}/admin/recover-account?token=${token}">Recuperar Conta</a>`
  });

  res.json({ success: true });
};

exports.verifyRecovery = async (req, res) => {
  const user = await User.findOne({
'accountRecovery.token': req.query.token,
'accountRecovery.expires': { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).render('admin/recovery-error');
  }

  req.session.recoveryToken = req.query.token;
  res.render('admin/reset-password');
};


exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Soft delete
    await course.softDelete();

    res.json({
      success: true,
      message: 'Course archived successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.lessons.id(req.params.lessonId).remove();
    await course.save();

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// @desc    Arquivar curso (soft delete)
// @route   DELETE /admin/courses/:id
// @access  Private (Admin)
const archiveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'archived', archivedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!course) {
    return next(new ErrorResponse('Curso não encontrado', 404));
  }

  // Disparar webhook para notificações
  await fetch(process.env.WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      event: 'course_archived',
      courseId: course._id
    })
  });

  res.json({ success: true });
});

// @desc    Remover aula permanentemente
// @route   DELETE /admin/courses/:courseId/lessons/:lessonId
// @access  Private (Admin)
const deleteLesson = asyncHandler(async (req, res) => {
  const result = await Course.updateOne(
    { _id: req.params.courseId },
    { $pull: { lessons: { _id: req.params.lessonId } } }
  );

  if (result.nModified === 0) {
    return next(new ErrorResponse('Aula não encontrada', 404));
  }

  res.json({ success: true });
});

