const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminCtrl');
const { ensureAdmin } = require('../middleware/auth');
const courseAdmin = require('../controllers/admin/courseAdmin');
const { ensureAdmin } = require('../middleware/auth');
const { postLimiter } = require('../middleware/rateLimiter');
const { ensureAdmin, verifyDefaultAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/coursePermissions');
const Admin = require('../models/Admin');


router.put('/users/:id', 
  ensureAdmin,
  logAdminAction('user_modified'),
  adminController.updateUser
);



// Aplicar a todas as rotas admin
router.use(ensureAdmin);
router.use(verifyDefaultAdmin);

// Rota específica para resetar senha do admin padrão
router.post('/reset-default-admin', 
  adminController.resetDefaultAdminPassword
);


// Rotas de cursos
router.post('/courses', 
  ensureAdmin, 
  postLimiter,
  courseAdmin.createCourse
);

router.post('/courses/schedule-class', 
  ensureAdmin,
  postLimiter,
  courseAdmin.scheduleClass
);


// Middleware de admin
router.use(ensureAdmin);

// Rotas principais
router.get('/', adminCtrl.getDashboard);
	
// Rotas de CRUD
router.get('/courses', require('../controllers/admin/courseAdmin').listCourses);
router.get('/courses/:id/edit', require('../controllers/admin/courseAdmin').editCourseForm);
router.put('/courses/:id', require('../controllers/admin/courseAdmin').updateCourse);

// Rotas de professores
router.get('/teachers/register', require('../controllers/admin/teacherAdmin').registerTeacherForm);
router.post('/teachers/register', require('../controllers/admin/teacherAdmin').registerTeacher);

// Rotas de relatórios
router.get('/analytics', require('../controllers/admin/analytics').generateReports);




router.get('/dashboard', isAdmin, adminCtrl.dashboard);
router.get('/teachers', isAdmin, adminCtrl.manageTeachers);
router.post('/approve-teacher/:id', isAdmin, adminCtrl.approveTeacher);
router.get('/courses', isAdmin, adminCtrl.manageCourses);
router.post('/courses', isAdmin, adminCtrl.createCourse);
// ... outras rotas CRUD

// Exemplo de uso em rotas:
router.get(
  '/admin/dashboard',
  ensureAuthenticated,
  ensureRole('admin'),
  adminController.dashboard
);

   router.put('/users/:id', 
     adminLogs.logAction('update', 'user'), 
     adminCtrl.updateUser
   );

   // 2FA Routes
router.get('/2fa-setup', adminController.show2FASetup);
router.post('/verify-2fa', adminController.verify2FA);

// Password Policy
router.use(checkPasswordExpiration);

// Account Recovery
router.post('/request-recovery', adminController.requestAccountRecovery);
router.get('/recover-account', adminController.verifyRecovery);

// Rotas protegidas para admin
router.delete('/courses/:id', isAdmin, adminController.deleteCourse);
router.delete('/courses/:courseId/lessons/:lessonId', isAdmin, adminController.deleteLesson);




   module.exports = router;