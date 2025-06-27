const Payment = require('../models/Payment');
const Course = require('../models/Course');
const { sendEmail } = require('../services/emailService');

exports.processPayment = async (req, res) => {
  try {
    const payment = new Payment({
      user: req.user._id,
      course: req.body.courseId,
      amount: req.body.amount,
      method: req.body.method,
      status: 'pending'
    });

    await payment.save();

    // Enviar comprovativo para admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'Novo pagamento pendente',
      text: `Novo pagamento de ${req.user.name} aguardando aprovação`
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Pagamento não encontrado' });
  }
  res.json({ status: payment.status });
};
