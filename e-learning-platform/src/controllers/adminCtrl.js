const Course = require('../models/Course');
const User = require('../models/User');
const Content = require('../models/Content');

// Painel de controle
exports.getDashboard = async (req, res) => {
  const stats = {
    pendingTeachers: await User.countDocuments({ role: 'teacher', approved: false }),
    pendingCourses: await Course.countDocuments({ status: 'pending' }),
    activeUsers: await User.countDocuments({ status: 'active' }),
    recentSignups: await User.find().sort('-createdAt').limit(5)
  };

  res.render('admin/dashboard', { stats });
};


// Middleware de verificação de admin
exports.ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.redirect('/');
};



// controllers/adminCtrl.js
exports.paymentApprovals = async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('student', 'fullName email')
      .populate('course', 'title');
    
    res.render('admin/payment-approvals', { 
      payments: pendingPayments,
      pageTitle: 'Aprovação de Pagamentos' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar pagamentos pendentes');
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { paymentId, status, feedback } = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { 
        status,
        adminFeedback: feedback,
        processedBy: req.user._id,
        processedAt: new Date()
      },
      { new: true }
    ).populate('student course');

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Se aprovado, liberar acesso ao curso
    if (status === 'approved') {
      await User.findByIdAndUpdate(payment.student._id, {
        $addToSet: { coursesEnrolled: payment.course._id }
      });

      // Notificar aluno
      await Notification.createAndSend(
        payment.student._id,
        'Pagamento Aprovado',
        `Seu pagamento para o curso ${payment.course.title} foi aprovado. O acesso foi liberado!`,
        'payment',
        payment._id,
        req.io
      );
    } else {
      // Notificar aluno sobre rejeição
      await Notification.createAndSend(
        payment.student._id,
        'Pagamento Rejeitado',
        `Seu pagamento para o curso ${payment.course.title} foi rejeitado. Motivo: ${feedback}`,
        'payment',
        payment._id,
        req.io
      );
    }

    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.presentialRequests = async (req, res) => {
  try {
    const requests = await PresentialRequest.find()
      .populate('student', 'fullName email')
      .populate('assignedTeacher', 'fullName')
      .sort({ createdAt: -1 });
    
    const teachers = await User.find({ role: 'teacher', isApproved: true });
    
    res.render('admin/presential-requests', { 
      requests,
      teachers,
      pageTitle: 'Solicitações de Aulas Presenciais' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar solicitações');
  }
};

User.findByIdAndUpdate(teacherId, { 
     chatEnabled: true,
     authorizedStudents: [arrayDeStudentIds] 
   });
   

   exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.status = user.status === 'active' ? 'suspended' : 'active';
  await user.save();

  // Notificar usuário
  await Notification.create({
    userId: user._id,
    title: `Conta ${user.status === 'active' ? 'Ativada' : 'Suspensa'}`,
    message: `Sua conta foi ${user.status} pelo administrador.`
  });

  res.json({ status: user.status });
};



   


