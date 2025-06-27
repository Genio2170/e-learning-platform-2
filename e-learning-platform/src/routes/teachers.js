const express = require('express');
const router = express.Router();
const { ensureAdmin, ensureAuth } = require('../middleware/auth');
const User = require('../models/User');
const teacherCtrl = require('../controllers/teacherCtrl');
const { ensureTeacher } = require('../middleware/auth');
const { isCourseOwner } = require('../middleware/coursePermissions');
const teacherController = require('../controllers/teacherController');


// Listar professores (com filtro)
router.get('/', async (req, res) => {
  try {
    const { expertise } = req.query;
    const filter = { role: 'teacher' };
    if (expertise) filter['teacherProfile.expertise'] = expertise;
    
    const teachers = await User.find(filter).lean();
    res.render('teachers/index', { 
      teachers,
      filters: { expertise }
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Rota para aprovação de professores (acesso admin)
router.post('/approve/:id', ensureAdmin, async (req, res) => {
  // Lógica para aprovar/cancelar perfil de professor
});

// Middleware para verificar se é professor
router.use(ensureTeacher);

// Rotas principais
router.get('/', teacherCtrl.getDashboard);
router.get('/schedule', teacherCtrl.getSchedule);
router.get('/chat', teacherCtrl.getStudentChat);

// Rotas protegidas para professores
router.post('/courses', teacherController.createCourse);
router.post('/courses/:courseId/lessons', isCourseOwner, teacherController.addLesson);



module.exports = router;
