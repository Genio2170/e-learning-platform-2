const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { 
    type: String, 
    required: true,
    index: true // Otimização para busca
  },
    description: { 
    type: String, 
    required: true,
    validate: [ // Validação customizada
      val => val.length >= 50,
'Descrição muito curta (mín. 50 caracteres)'
    ]
  },
   shortDescription: { type: String, maxlength: 150 },
  category: { type: String, required: true },
  subcategories: [{ type: String }],
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  promoVideo: { type: String }, // URL do vídeo promocional
  thumbnail: { type: String, required: true },
  promoVideo: { type: String },
  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
    teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    immutable: true // Não pode ser alterado após criação
  },
  category: { type: String, required: true },
  lessons: [{
    title: String,
    content: String,
    videoUrl: String,
    duration: Number, // in minutes
    createdAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    set: function(val) { // Normalização automática
      return val.toLowerCase();
    }
  },
  createdAt: { type: Date, default: Date.now },
  classes: [{
    date: Date,
    duration: Number, // em minutos
    type: { type: String, enum: ['live', 'presential'] },
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'canceled'],
      default: 'scheduled'
    }
  }],
   lessons: [{ // Subdocumento para aulas
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Título muito longo']
    },
    resources: [{ // Array de recursos
      url: String,
      type: {
        type: String,
        enum: ['video', 'pdf', 'quiz']
      }
    }]
  }],
   price: { type: Number, required: true },
  discountPrice: { type: Number },
  averageRating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true } // Para incluir virtuais na API
});

// Método de instância
courseSchema.methods.publish = function() {
  this.status = 'published';
  return this.save();
};

// Query Helper
courseSchema.query.byTeacher = function(teacherId) {
  return this.where({ teacher: teacherId });
};


// Atualizar média de avaliações
courseSchema.methods.updateRating = async function() {
  const reviews = await this.model('Review').find({ course: this._id });
  this.averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
  this.reviewsCount = reviews.length;
  await this.save();
};

// Soft delete for admin
courseSchema.methods.softDelete = function() {
  this.status = 'archived';
  return this.save();
};


 module.exports = mongoose.model('Course', courseSchema);