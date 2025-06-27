const express = require('express');
const router = express.Router();
const studentCtrl = require('../controllers/studentCtrl');
const { ensureStudent } = require('../middleware/auth');

router.get('/', ensureStudent, studentCtrl.getDashboard);
router.get('/courses', ensureStudent, studentCtrl.getAvailableCourses);
router.get('/chat', ensureStudent, studentCtrl.getTeacherChat);
// ... outras rotas

module.exports = router;