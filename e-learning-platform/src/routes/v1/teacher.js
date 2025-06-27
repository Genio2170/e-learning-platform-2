const express = require('express');
const router = express.Router();
const { 
  isCourseOwner, 
  hasCourseAccess 
} = require('../../middleware/coursePermissions');
const {
  createCourse,
  addLesson,
  publishCourse
} = require('../../controllers/v1/teacherController');

// Versionamento + Proteção de Rotas
router.use(hasCourseAccess('teacher'));

router.route('/courses')
  .post(createCourse)
  .get(listCourses); // Paginação implementada

router.route('/courses/:id/lessons')
  .put(isCourseOwner, addLesson)
  .get(isCourseOwner, getLessons);

router.patch('/courses/:id/publish', isCourseOwner, publishCourse);


module.exports = router;