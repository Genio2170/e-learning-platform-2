const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');

// Listar cursos por categoria
exports.listCoursesByCategory = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'category',
          as: 'courses'
        }
      },
      { $match: { 'courses.0': { $exists: true } } },
      { $project: { name: 1, description: 1, courses: { $slice: ['$courses', 3] } } }
    ]);

    // Verificar acesso do usuário
    if (req.user) {
      const user = await User.findById(req.user._id).select('coursesEnrolled');
      categories.forEach(category => {
        category.courses.forEach(course => {
          course.isEnrolled = user.coursesEnrolled.includes(course._id.toString());
        });
      });
    }

    res.render('courses/index', {
      title: 'Nossos Cursos',
      categories,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/500', { title: 'Erro no Servidor' });
  }
};

// Detalhes do curso
exports.courseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('category', 'name')
      .populate('teacher', 'name photo bio');
    
    if (!course) {
      return res.status(404).render('errors/404', { title: 'Curso Não Encontrado' });
    }

    const isEnrolled = req.user ? 
      req.user.coursesEnrolled.includes(course._id.toString()) : false;

    // Verificar pagamento pendente
    const hasPendingPayment = req.user ? 
      await Payment.exists({ user: req.user._id, course: course._id, status: 'pending' }) : 
      false;

    res.render('courses/details', {
      title: course.title,
      course,
      isEnrolled,
      hasPendingPayment,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/500', { title: 'Erro no Servidor' });
  }
};

// Acessar conteúdo do curso
exports.accessCourse = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      req.flash('error_msg', 'Você precisa estar logado para acessar este conteúdo');
      return res.redirect('/auth/login');
    }

    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!user.coursesEnrolled.includes(course._id.toString())) {
      req.flash('error_msg', 'Você não tem acesso a este curso');
      return res.redirect('/courses');
    }

    res.render('courses/learn', {
      title: `Aprender: ${course.title}`,
      course,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/500', { title: 'Erro no Servidor' });
  }
};

