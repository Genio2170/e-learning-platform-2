exports.listCourses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Query otimizada
  const query = Course.find()
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .lean()
    .cache({ key: `courses-page-${page}` }); // Usando cache

  const [courses, total] = await Promise.all([
    query.exec(),
    Course.countDocuments()
  ]);

  res.json({
    data: courses,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  });
};

await notificationService.sendUserNotification(
  studentId,
  {
    type: 'course_update',
    title: 'Novo material disponível',
    message: `O curso "${course.name}" foi atualizado`,
    metadata: { courseId }
  }
);

