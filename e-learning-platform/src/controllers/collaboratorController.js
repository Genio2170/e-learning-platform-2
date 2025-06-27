exports.inviteCollaborator = async (req, res) => {
  const { email, role } = req.body;

  // Verificar se usuário existe
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  // Verificar se já é colaborador
  const existing = await CourseCollaborator.findOne({
    courseId: req.params.courseId,
    userId: user._id
  });

  if (existing) {
    return res.status(400).json({ error: 'Usuário já é colaborador' });
  }

  // Criar convite
  const collaborator = new CourseCollaborator({
    courseId: req.params.courseId,
    userId: user._id,
    role,
    invitedBy: req.user.id,
    permissions: getDefaultPermissions(role)
  });

  await collaborator.save();

  // Enviar notificação
  await Notification.create({
    userId: user._id,
    type: 'collaboration_invite',
    metadata: {
      courseId: req.params.courseId,
      inviter: req.user.name
    }
  });

  res.json({ success: true, data: collaborator });
};

function getDefaultPermissions(role) {
  const roles = {
    assistant: { addLessons: true, editContent: false, publish: false },
    editor: { addLessons: true, editContent: true, publish: false },
    reviewer: { addLessons: false, editContent: false, publish: true }
  };
  return roles[role] || roles.assistant;
}


exports.acceptInvite = async (req, res) => {
  const { token } = req.params;
  const invite = await CollaboratorInvite.findOne({ token });

  if (!invite || invite.expiresAt < new Date()) {
    return res.status(400).render('error', { message: 'Convite inválido ou expirado' });
  }

  const collaborator = new CourseCollaborator({
    courseId: invite.courseId,
    userId: req.user.id,
    role: invite.role
  });

  await Promise.all([
    collaborator.save(),
    invite.updateOne({ status: 'accepted' })
  ]);

  res.redirect(`/courses/${invite.courseId}?joined=true`);
};
