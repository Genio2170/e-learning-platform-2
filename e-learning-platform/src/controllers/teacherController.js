exports.createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const course = new Course({
      title,
      description,
      category,
      teacher: req.user._id,
      status: 'draft'
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

exports.addLesson = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      teacher: req.user._id
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.lessons.push(req.body);
    await course.save();

    res.json({
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

// @desc    Criar novo curso
// @route   POST /teacher/courses
// @access  Private (Teacher)
const createCourse = asyncHandler(async (req, res) => {
  // Validação manual adicional
  if (!req.body.teacher) req.body.teacher = req.user.id;

  // Criação com tratamento de transação
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await Course.create([req.body], { session });

    // Atualizar contador do professor
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { courseCount: 1 } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: course[0]
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

// @desc    Adicionar aula a curso existente
// @route   PUT /teacher/courses/:id/lessons
// @access  Private (Teacher)
const addLesson = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    teacher: req.user.id,
    status: { $ne: 'archived' }
  });

  if (!course) {
    return next(new ErrorResponse('Curso não encontrado ou sem permissão', 404));
  }

  // Validação estrutural da aula
  if (!req.body.videoUrl && !req.body.content) {
    return next(new ErrorResponse('Aula deve ter vídeo ou conteúdo', 400));
  }

  course.lessons.push(req.body);
  await course.save();

  res.json({
    success: true,
    data: course.lessons[course.lessons.length - 1] // Retorna a última aula adicionada
  });
});
