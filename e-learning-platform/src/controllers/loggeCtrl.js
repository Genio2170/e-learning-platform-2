exports.createCourse = async (req, res) => {
  try {
    req.logger.info('Iniciando criação de curso', { user: req.user.id });

    const course = await Course.create(req.body);
    req.logger.debug('Curso criado com sucesso', { courseId: course._id });

    res.status(201).json(course);
  } catch (err) {
    req.logger.error('Falha ao criar curso', {
      error: err.message,
      stack: err.stack,
      body: req.body
    });

    res.status(500).json({ error: 'Erro interno' });
  }
};
