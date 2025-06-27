// routes/mobile/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../../models/Course');
const { ensureAuthenticated } = require('../../middleware/auth');

// Otimizado para mobile
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const courses = await Course.find()
      .select('title thumbnail shortDescription price discountPrice averageRating')
      .sort('-createdAt')
      .limit(10);
      
    res.json({
      success: true,
      data: courses.map(course => ({
        id: course._id,
        title: course.title,
        image: course.thumbnail,
        description: course.shortDescription,
        price: course.discountPrice || course.price,
        rating: course.averageRating || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Erro ao carregar cursos' 
    });
  }
});

module.exports = router;