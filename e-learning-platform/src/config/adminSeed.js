const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

async function initAdmin() {
  const existe = await Admin.findOne({ email: 'admin@plataforma.com' });
  if (!existe) {
    await Admin.create({
      nome: 'Administrador Principal',
      email: 'admin@plataforma.com',
      senha: 'Franci5cocs.' // Pode ser trocado depois no painel
    });
    console.log('✔ Admin criado com sucesso.');
  }
}

module.exports = initAdmin;

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 12);

      const admin = new User({
        name: 'Admin Principal',
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isDefaultAdmin: true,
        emailVerified: true,
        permissions: ['full_access']
      });

      await admin.save();
      console.log('✅ Admin padrão criado com sucesso');
    }
  } catch (err) {
    console.error('Erro ao criar admin padrão:', err);
  }
};

module.exports = createDefaultAdmin;
