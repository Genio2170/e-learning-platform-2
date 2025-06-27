const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseCtrl');
const { ensureAuthenticated } = require('../middlewares/auth');
const upload = require('../services/fileUpload');

// Listagem de cursos
router.get('/', courseController.listCoursesByCategory);

// Detalhes do curso
router.get('/:id', courseController.courseDetails);

// Acessar conteúdo (protegido)
router.get('/learn/:id', ensureAuthenticated, courseController.accessCourse);

// Upload de comprovante
router.post('/:id/payment-proof', 
  ensureAuthenticated,
  upload.single('proof'),
  courseController.uploadPaymentProof
);

// API para vídeo promocional
router.get('/api/courses/:id/promo-video', async (req, res) => {
  const course = await Course.findById(req.params.id).select('promoVideo');
  res.json({ videoUrl: course.promoVideo });
});

// API para subcategorias
router.get('/api/categories/:id/subcategories', async (req, res) => {
  const category = await Category.findById(req.params.id).select('subcategories');
  res.json(category.subcategories);
});

module.exports = router;
