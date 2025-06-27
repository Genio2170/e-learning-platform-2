// routes/api/auth.js
const express = require('express');
const router = express.Router();

router.get('/check', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user._id,
      role: req.user.role,
      name: req.user.fullName
    } : null
  });
});

router.get('/protected-content/:type', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  switch (req.params.type) {
    case 'featured-courses':
      // Lógica para obter cursos em destaque
      res.json({ courses: getFeaturedCourses(req.user) });
      break;
    case 'teacher-list':
      // Lógica para obter lista de professores
      res.json({ teachers: getApprovedTeachers() });
      break;
    default:
      res.status(404).json({ error: 'Endpoint não encontrado' });
  }
});

module.exports = router;