// routes/index.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureProfileComplete } = require('../middleware/auth');
const homeController = require('../controllers/homeCtrl');
const aboutController = require('../controllers/aboutCtrl');
const profileController = require('../controllers/profileController');
const { ensureAuthenticated, ensureProfileComplete } = require('../middleware/auth');
const homeController = require('../controllers/homeController');

// Rotas de perfil
router.get('/profile', ensureAuthenticated, profileController.showProfile);
router.get('/profile/edit', ensureAuthenticated, profileController.editProfile);
router.post('/profile/update', ensureAuthenticated, profileController.updateProfile);

// Página inicial - apenas conteúdo público
router.get('/', (req, res) => {
  res.render('home', { 
    user: req.user,
    // Dados públicos apenas
    featuredCourses: getPublicCourses(),
    testimonials: getPublicTestimonials()
  });
});
// Rota principal
router.get('/', homeController.getHomePage);

// Página de cursos - requer autenticação
router.get('/courses', ensureAuthenticated, ensureProfileComplete, (req, res) => {
  res.render('courses/index', {
    user: req.user,
    courses: getAllCoursesForUser(req.user)
  });
});

// Página de professores - requer autenticação
router.get('/teachers', ensureAuthenticated, ensureProfileComplete, (req, res) => {
  res.render('teachers/index', {
    user: req.user,
    teachers: getApprovedTeachers()
  });
});

// Página inicial
router.get('/', homeController.getHomePage);
// Página sobre
router.get('/about', aboutController.getAboutPage);
// Outras rotas protegidas...

// Rota de Contacto
router.get('/contact', (req, res) => {
  res.render('contact', {
    pageTitle: 'Contacte-nos',
    socialLinks: [
      { name: 'Facebook', url: '#', icon: 'facebook' },
      { name: 'Instagram', url: '#', icon: 'instagram' },
      { name: 'LinkedIn', url: '#', icon: 'linkedin' },
      { name: 'Twitter', url: '#', icon: 'twitter' }
    ],
    contactInfo: {
      email: 'suporte@plataforma.edu',
      phone: '+244 123 456 789',
      address: 'Luanda, Angola'
    }
  });
});

// Processar formulário (POST)
router.post('/contact', (req, res) => {
  // Lógica para enviar email ao admin (usar emailService.js)
});

const { postLimiter } = require('../middleware/rateLimiter');

router.post('/profile/update', 
  ensureAuthenticated, 
  postLimiter,
  profileController.updateProfile
);


module.exports = router;