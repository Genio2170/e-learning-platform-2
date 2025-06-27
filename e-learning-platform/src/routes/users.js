// routes/users.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureProfileComplete } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuração do upload de foto
const storage = multer.diskStorage({
  destination: 'public/uploads/profiles/',
  filename: (req, file, cb) => {
    cb(null, req.user._id + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Apenas imagens são permitidas (JPEG, JPG, PNG)');
    }
  }
});

// Visualizar perfil
router.get('/profile', ensureAuthenticated, ensureProfileComplete, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('coursesEnrolled', 'title thumbnail progress');
    
    res.render('users/profile', {
      user,
      pageTitle: 'Meu Perfil'
    });
  } catch (err) {
    req.flash('error_msg', 'Erro ao carregar perfil');
    res.redirect('/users/dashboard');
  }
});

// Editar perfil
router.get('/profile/edit', ensureAuthenticated, (req, res) => {
  res.render('users/edit-profile', {
    user: req.user,
    pageTitle: 'Editar Perfil',
    error_msg: req.flash('error_msg')
  });
});

// Atualizar perfil
router.post('/profile', ensureAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    const updates = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      bio: req.body.bio
    };
    
    if (req.file) {
      updates.photo = '/uploads/profiles/' + req.file.filename;
    }
    
    await User.findByIdAndUpdate(req.user._id, updates);
    
    req.flash('success_msg', 'Perfil atualizado com sucesso!');
    res.redirect('/users/profile');
  } catch (err) {
    req.flash('error_msg', 'Erro ao atualizar perfil: ' + err.message);
    res.redirect('/users/profile/edit');
  }
});

module.exports = router;