const mongoose = require('mongoose');
// models/Coupon.js
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  maxUses: { type: Number },
  currentUses: { type: Number, default: 0 },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Vazio = todos os cursos
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Método para validar cupom
couponSchema.methods.validate = function(courseId) {
  const now = new Date();
  
  if (this.validFrom > now) return { isValid: false, reason: 'Cupom ainda não está válido' };
  if (this.validUntil < now) return { isValid: false, reason: 'Cupom expirado' };
  if (this.maxUses && this.currentUses >= this.maxUses) return { isValid: false, reason: 'Cupom esgotado' };
  if (this.courses.length > 0 && !this.courses.includes(courseId)) {
    return { isValid: false, reason: 'Cupom não válido para este curso' };
  }
  
  return { isValid: true };
};

 module.exports = mongoose.model('Coupon', couponSchema);