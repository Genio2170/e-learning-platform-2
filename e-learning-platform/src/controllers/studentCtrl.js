const Course = require('../models/Course');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const Message = require('../models/Message');

// Painel principal do aluno
exports.getDashboard = async (req, res) => {
  const studentId = req.user._id;
  
  const [courses, notifications, pendingPayments] = await Promise.all([
    Course.find({ students: studentId, approved: true }),
    Notification.find({ userId: studentId }).sort('-createdAt').limit(5),
    Payment.find({ userId: studentId, status: 'pending' })
  ]);

  res.render('users/student/dashboard', {
    user: req.user,
    courses,
    notifications,
    hasPendingPayments: pendingPayments.length > 0
  });
};

// Cursos disponíveis (aprovados pelo admin)
exports.getAvailableCourses = async (req, res) => {
  const courses = await Course.find({ 
    status: 'published',
    approved: true 
  }).populate('teacher');

  res.render('users/student/courses', { courses });
};

// Chat com professores
exports.getTeacherChat = async (req, res) => {
  const teachers = await User.find({ 
    role: 'teacher',
    chatEnabled: true  // Campo controlado pelo admin
  });

  const messages = await Message.find({
    $or: [
      { from: req.user._id, to: { $in: teachers.map(t => t._id) } },
      { to: req.user._id, from: { $in: teachers.map(t => t._id) } }
    ]
  }).sort('createdAt');

  res.render('users/student/chat-teachers', { teachers, messages });
};
