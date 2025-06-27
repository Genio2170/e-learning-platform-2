// controllers/teacherCtrl.js
exports.dashboard = async (req, res) => {
  try {
    // Estatísticas básicas
    const courses = await Course.countDocuments({ teacher: req.user._id });
    const students = await User.countDocuments({ 
      coursesEnrolled: { $in: await Course.find({ teacher: req.user._id }).distinct('_id') }
    });
    
    // Dados para gráficos
    const enrollmentData = await Course.aggregate([
      { $match: { teacher: req.user._id } },
      { $project: { title: 1, studentsCount: { $size: '$studentsEnrolled' } } },
      { $sort: { studentsCount: -1 } },
      { $limit: 5 }
    ]);
    
    const revenueData = await Payment.aggregate([
      { 
        $match: { 
          course: { $in: await Course.find({ teacher: req.user._id }).distinct('_id') },
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.render('teachers/dashboard', {
      courses,
      students,
      enrollmentData,
      revenueData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar dashboard');
  }
};


const LiveSession = require('../models/LiveSession');
const PresentialRequest = require('../models/PresentialRequest');
const Notification = require('../models/Notification');

// Painel principal do professor
exports.getDashboard = async (req, res) => {
  const teacherId = req.user._id;
  
  const [liveSessions, presentialClasses, notifications] = await Promise.all([
    LiveSession.find({ teacher: teacherId, date: { $gte: new Date() } }),
    PresentialRequest.find({ teacher: teacherId, status: 'approved' }),
    Notification.find({ userId: teacherId }).sort('-createdAt').limit(5)
  ]);

  res.render('teachers/dashboard', {
    user: req.user,
    liveSessions,
    presentialClasses,
    notifications
  });
};

// Agenda de aulas
exports.getSchedule = async (req, res) => {
  const teacherId = req.user._id;
  
  const [upcomingLive, upcomingPresential] = await Promise.all([
    LiveSession.find({ 
      teacher: teacherId,
      date: { $gte: new Date() }
    }).populate('students'),
    
    PresentialRequest.find({
      teacher: teacherId,
      date: { $gte: new Date() },
      status: 'approved'
    }).populate('student')
  ]);

  res.render('teachers/schedule', {
    liveSessions: upcomingLive,
    presentialClasses: upcomingPresential
  });
};

// Chat com alunos (após aprovação)
exports.getStudentChat = async (req, res) => {
  if (!req.user.chatEnabled) {
    return res.render('teachers/chat-disabled');
  }

  const students = await User.find({
    _id: { $in: req.user.authorizedStudents } // Array controlado pelo admin
  });

  res.render('teachers/student-chat', { students });
};

   javascript
   await Notification.create({
     userId: teacherId,
     title: 'Chat Ativado',
     message: 'Você agora pode conversar com alunos autorizados.',
     type: 'system'
   });