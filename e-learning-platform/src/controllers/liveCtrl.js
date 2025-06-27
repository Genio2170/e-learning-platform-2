const LiveSession = require('../models/LiveSession');
const User = require('../models/User');
const { sendNotification } = require('../services/notificationService');

exports.createSession = async (req, res) => {
  try {
    const session = new LiveSession({
      ...req.body,
      teacher: req.user._id
    });
    await session.save();

    await sendNotification({
      userId: req.user._id,
      title: 'Aula criada',
      message: `Sua aula "${session.title}" foi agendada`
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.joinSession = async (req, res) => {
  const session = await LiveSession.findById(req.params.id)
    .populate('teacher', 'name email');

  if (!session) {
    return res.status(404).json({ error: 'Aula não encontrada' });
  }

  res.render('live/session', { session });
};
