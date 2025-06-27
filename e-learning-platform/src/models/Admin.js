const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String
});

adminSchema.pre('save', async function () {
  if (this.isModified('senha')) {
    this.senha = await bcrypt.hash(this.senha, 10);
  }
});

module.exports = mongoose.model('Admin', adminSchema);
