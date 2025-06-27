exports.rollbackVersion = async (req, res) => {
  const { versionId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const version = await CourseVersion.findById(versionId).session(session);
    const course = await Course.findById(version.courseId).session(session);

    // Restaurar dados
    Object.assign(course, version.data);
    course.__v = version.data.__v; // Manter controle de versão

    // Criar novo registro de versão
    await saveVersion(course, req.user.id);
    await course.save({ session });

    await session.commitTransaction();

    res.json({ success: true, data: course });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};
