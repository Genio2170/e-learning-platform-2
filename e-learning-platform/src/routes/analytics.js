// routes/analytics.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');
const excel = require('exceljs');
const Course = require('../models/Course');

router.get('/export/courses', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
  try {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Cursos');
    
    // Cabeçalhos
    worksheet.columns = [
      { header: 'Título', key: 'title', width: 30 },
      { header: 'Professor', key: 'teacher', width: 25 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Preço', key: 'price', width: 15 },
      { header: 'Alunos', key: 'students', width: 15 },
      { header: 'Avaliação', key: 'rating', width: 15 }
    ];
    
    // Dados
    const courses = await Course.find()
      .populate('teacher', 'fullName')
      .select('title category price discountPrice studentsEnrolled averageRating');
    
    courses.forEach(course => {
      worksheet.addRow({
        title: course.title,
        teacher: course.teacher.fullName,
        category: course.category,
        price: course.discountPrice || course.price,
        students: course.studentsEnrolled.length,
        rating: course.averageRating || 'N/A'
      });
    });
    
    // Configurar resposta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=cursos.xlsx'
    );
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;