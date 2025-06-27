// services/emailService.js
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Configuração do transporter (exemplo para Gmail)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Enviar email de recuperação
module.exports.sendPasswordReset = async (user, token) => {
  try {
    const resetUrl = `${process.env.DOMAIN}/auth/reset-password/${token}`;
    
    const mailOptions = {
      to: user.email,
      subject: 'Redefinição de Senha - Plataforma de Aulas Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Redefinição de Senha</h2>
          <p>Olá ${user.fullName},</p>
          <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para continuar:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               Redefinir Senha
            </a>
          </p>
          <p>Se você não solicitou esta redefinição, por favor ignore este email.</p>
          <p>O link expirará em 1 hora.</p>
          <p>Atenciosamente,<br>Equipe Plataforma de Aulas Online</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Se tiver telefone, enviar SMS também
    if (user.phone) {
      await sendPasswordResetSMS(user, token);
    }
  } catch (err) {
    console.error('Erro ao enviar email de recuperação:', err);
    throw err;
  }
};

// Enviar confirmação de alteração
module.exports.sendPasswordChangedConfirmation = async (user) => {
  try {
    const mailOptions = {
      to: user.email,
      subject: 'Senha Alterada - Plataforma de Aulas Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Senha Alterada com Sucesso</h2>
          <p>Olá ${user.fullName},</p>
          <p>Sua senha foi redefinida com sucesso em ${new Date().toLocaleString()}.</p>
          <p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>
          <p>Atenciosamente,<br>Equipe Plataforma de Aulas Online</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Erro ao enviar email de confirmação:', err);
  }
};

// Serviço de SMS (exemplo com Twilio)
async function sendPasswordResetSMS(user, token) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return;
  
  const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  try {
    const resetUrl = `${process.env.DOMAIN}/auth/reset-password/${token}`;
    await client.messages.create({
      body: `Redefina sua senha: ${resetUrl} (expira em 1 hora)`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone
    });
  } catch (err) {
    console.error('Erro ao enviar SMS:', err);
  }
}

exports.sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"Plataforma de E-Learning" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
};



