const User = require('../models/User');
const { uploadFile } = require('../services/fileUpload');
const { validateProfileUpdate } = require('../validators/profileValidator');
const { uploadToCloudinary } = require('../services/fileUpload');
const ProfileHistory = require('../models/ProfileHistory');

exports.showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render('users/profile', { 
      user,
      title: 'Meu Perfil'
    });
  } catch (err) {
    req.flash('error', 'Erro ao carregar perfil');
    res.redirect('/dashboard');
  }
};

exports.editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render('users/edit-profile', { 
      user,
      title: 'Editar Perfil',
      messages: {
        error: req.flash('error'),
        success: req.flash('success')
      }
    });
  } catch (err) {
    req.flash('error', 'Erro ao carregar formulário');
    res.redirect('/profile');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Validação
    await validateProfileUpdate(req);

    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      idNumber: req.body.idNumber,
      birthDate: req.body.birthDate,
      address: req.body.address
    };

    // Upload de imagem se existir
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'profile-photos');
      updates.profilePhoto = result.secure_url;
    }

    // Atualizar usuário
    await User.findByIdAndUpdate(req.user._id, updates);

    req.flash('success', 'Perfil atualizado com sucesso');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', err.message || 'Erro ao atualizar perfil');
    res.redirect('/profile/edit');
  }
};


exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('profile/view', { user });
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    if (req.file) {
      updates.profilePhoto = await uploadFile(req.file, 'profiles');
    }

    await User.findByIdAndUpdate(req.user._id, updates);
    req.flash('success', 'Perfil atualizado com sucesso');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Erro ao atualizar perfil');
    res.redirect('/profile/edit');
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userBeforeUpdate = await User.findById(req.user._id);
    const changes = [];

    // Identificar mudanças
    const fields = ['name', 'email', 'phone', 'idNumber', 'birthDate', 'address', 'profilePhoto'];
    fields.forEach(field => {
      if (req.body[field] && req.body[field] !== userBeforeUpdate[field].toString()) {
        changes.push({
          field,
          oldValue: userBeforeUpdate[field],
          newValue: req.body[field]
        });
      }
    });

    // Atualizar usuário (...)

    // Registrar histórico
    if (changes.length > 0) {
      await ProfileHistory.create({
        user: req.user._id,
        changedBy: req.user._id,
        changes,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    // ...
  } catch (err) {
    // ...
  }
};

exports.getProfileHistory = async (req, res) => {
  const history = await ProfileHistory.find({ user: req.params.userId })
    .sort('-createdAt')
    .populate('changedBy', 'name email');

  res.render('admin/profile-history', { history });
};


