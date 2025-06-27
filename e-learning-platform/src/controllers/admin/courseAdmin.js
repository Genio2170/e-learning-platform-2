const Course = require('../../models/Course');
const { validateCourse } = require('../../validators/courseValidator');

exports.createCourse = async (req, res) => {
  try {
    await validateCourse(req.body);

    const course = new Course({
      ...req.body,
      createdBy: req.user._id,
      status: 'pending'
    });

    await course.save();

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.scheduleClass = async (req, res) => {
  try {
    const { courseId, date, duration, type } = req.body;

    const course = await Course.findById(courseId);
    if (!course) throw new Error('Curso não encontrado');

    const newClass = {
      date: new Date(date),
      duration,
      type,
      status: 'scheduled'
    };

    course.classes.push(newClass);
    await course.save();

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};


// Listar todos os cursos
exports.listCourses = async (req, res) => {
  const courses = await Course.find().populate('teacher');
  res.render('admin/courses/list', { courses });
};

// Formulário de edição
exports.editCourseForm = async (req, res) => {
  const course = await Course.findById(req.params.id);
  const teachers = await User.find({ role: 'teacher', approved: true });
  res.render('admin/courses/form', { course, teachers });
};

// Atualizar curso
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  await Course.findByIdAndUpdate(id, req.body);
  req.flash('success', 'Curso atualizado com sucesso');
  res.redirect('/admin/courses');
};

// Aprovar conteúdo
exports.approveContent = async (req, res) => {
  await Course.findByIdAndUpdate(req.params.id, { 
    status: 'published',
    approvedBy: req.user._id 
  });
  // Notificar professor
  await Notification.create({
    userId: course.teacher,
    title: 'Curso Aprovado',
    message: `Seu curso "${course.title}" foi aprovado e está publicado.`
  });
  res.redirect('back');
};
