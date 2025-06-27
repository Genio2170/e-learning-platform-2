const OTP = require('../models/OTP');
const emailService = require('./emailService');
const crypto = require('crypto');

// Gerar e enviar OTP
exports.generateAndSendOTP = async (email) => {
  // Gerar código de 6 dígitos
  const otp = crypto.randomInt(100000, 999999).toString();
  
  // Salvar no banco (sobrescreve se já existir)
  await OTP.findOneAndUpdate(
    { email },
    { otp },
    { upsert: true, new: true }
  );

  // Enviar e-mail
  await emailService.sendEmail({
    to: email,
    subject: 'Seu Código de Verificação',
    html: `
      <h2>Use este código para verificar seu e-mail</h2>
      <p style="font-size: 24px; letter-spacing: 2px; font-weight: bold;">${otp}</p>
      <p>Este código expira em 5 minutos.</p>
    `
  });

  return otp;
};

// Verificar OTP
exports.verifyOTP = async (email, otp) => {
  const record = await OTP.findOne({ email });
  if (!record) return false;
  
  return record.otp === otp;
};
