const emailService = require('../services/emailService');

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Enviar email para o admin
    await emailService.sendEmail({
      to: 'admin@plataforma.edu',
      subject: `[Contacto] ${subject}`,
      text: `De: ${name} (${email})\n\n${message}`
    });

    req.flash('success', 'Mensagem enviada com sucesso!');
    res.redirect('/contact');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao enviar mensagem');
    res.redirect('/contact');
  }
};
