exports.getNotifications = async (req, res) => {
  const { filter } = req.query;
  const { _id: userId, role } = req.user;

  const query = { userId };

  // Filtros específicos por perfil
  if (filter === 'unread') query.isRead = false;

  if (role === 'student'&& filter === 'course') {
    query.type = { $in: ['course_update', 'new_material'] };
  }

  if (role === 'teacher'&& filter === 'submission') {
    query.type = 'new_assignment_submission';
  }

  const notifications = await Notification.find(query)
    .sort('-createdAt')
    .limit(50);

  res.json(notifications);
};

exports.markAsRead = async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
};

// (Adicionar outras funções do controller)


exports.markAsRead = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Atualização otimista
    const [result] = await Promise.all([
      Notification.updateOne(
        { _id: req.params.id },
        { $set: { isRead: true } },
        { session }
      ),
      NotificationRead.create([{
        notificationId: req.params.id,
        userId: req.user._id
      }], { session })
    ]);

    await session.commitTransaction();

    if (result.nModified === 0) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    res.json({ success: true });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

exports.getNotifications = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

  // Adicionar metadados de paginação
  const total = await Notification.countDocuments({ userId: req.user._id });

  res.set('X-Pagination-Total', total);
  res.set('X-Pagination-Pages', Math.ceil(total / limit));

  res.json(notifications);
};

