// routes/presentialRequests.js
const express = require('express');
const router = express.Router();
const PresentialRequest = require('../models/PresentialRequest');
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');

// Aluno cria solicitação de aula presencial
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const request = new PresentialRequest({
      student: req.user._id,
      subject: req.body.subject,
      description: req.body.description,
      preferredDate: req.body.preferredDate,
      preferredLocation: req.body.preferredLocation
    });

    await request.save();

    // Notificar admin
    await Notification.createAndSend(
      null, // Enviar para todos os admins
      'Nova Solicitação de Aula Presencial',
      `O aluno ${req.user.fullName} solicitou uma aula presencial de ${req.body.subject}`,
      'presential',
      request._id,
      req.io,
      { isAdminNotification: true }
    );

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin aprova/rejeita solicitação
router.put('/:id/status', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
  try {
    const { status, feedback, teacherId } = req.body;
    
    const update = { 
      status,
      adminFeedback: feedback 
    };

    if (status === 'approved' && teacherId) {
      update.assignedTeacher = teacherId;
    }

    const request = await PresentialRequest.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Notificar aluno
    await Notification.createAndSend(
      request.student,
      'Atualização na Sua Solicitação',
      `Sua solicitação de aula presencial foi ${status}`,
      'presential',
      request._id,
      req.io
    );

    // Se aprovado e com professor atribuído, notificar o professor
    if (status === 'approved' && teacherId) {
      await Notification.createAndSend(
        teacherId,
        'Nova Aula Presencial Atribuída',
        `Você foi designado para uma aula presencial com ${request.student.fullName}`,
        'presential',
        request._id,
        req.io
      );
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adicionar mensagem à solicitação
router.post('/:id/messages', ensureAuthenticated, async (req, res) => {
  try {
    const request = await PresentialRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Verificar se o usuário tem permissão (aluno, admin ou professor atribuído)
    const isAllowed = request.student.equals(req.user._id) || 
                     req.user.role === 'admin' || 
                     (request.assignedTeacher && request.assignedTeacher.equals(req.user._id));
    
    if (!isAllowed) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    request.messages.push({
      sender: req.user._id,
      content: req.body.content
    });

    await request.save();

    // Determinar quem notificar
    let recipient;
    if (req.user.role === 'admin') {
      recipient = request.student;
    } else if (req.user._id.equals(request.student)) {
      recipient = request.assignedTeacher || null; // Se ainda não tiver professor, notifica admin
    } else {
      recipient = request.student;
    }

    if (recipient) {
      await Notification.createAndSend(
        recipient,
        'Nova Mensagem em Aula Presencial',
        `Você tem uma nova mensagem sobre sua aula de ${request.subject}`,
        'presential',
        request._id,
        req.io
      );
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
