const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
 name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  idNumber: { type: String },
  birthDate: { type: Date },
  address: { type: String, required: true },
  profilePhoto: { type: String },
  class: { type: String }, // Para alunos
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  isApproved: { type: Boolean, default: false }, // Para professores
  coursesEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now },
    resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  teacherProfile: {
    bio: String,
    expertise: [String], // Ex: ['Matemática', 'Física']
    photo: String, // URL da imagem (armazenada em public/uploads/profiles/)
    rating: { type: Number, default: 0 }
  },
    isDefaultAdmin: {
    type: Boolean,
    default: false
  },
  twoFactorAuth: {
  enabled: Boolean,
  secret: String,
  backupCodes: [String]
},
passwordChangedAt: Date

});



module.exports = mongoose.model('User',userSchema);


