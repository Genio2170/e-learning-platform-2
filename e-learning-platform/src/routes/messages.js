// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { ensureAuthenticated } = require('../middleware/auth');

// Enviar mensagem
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { recipient, content } = req.body;
    
    const message = new Message({
      sender: req.user._id,
      recipient,
      content
    });
    
    await message.save();
    
    // Emitir evento via Socket.io
    req.io.to(`user-${recipient}`).emit('new-message', message);
    
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter conversas
router.get('/conversations', ensureAuthenticated, async (req, res) => {
  try {
    const conversas = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          },
          content: 1,
          isRead: 1,
          createdAt: 1,
          sender: 1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'otherUser',
          foreignField: '_id',
          as: 'otherUserData'
        }
      },
      {
        $unwind: '$otherUserData'
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$recipient', req.user._id] },
                  { $eq: ['$isRead', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    res.json(conversas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;