const Course = require('../models/Course');

exports.getHomePage = async (req, res) => {
  try {
    const featuredCourses = await Course.find({ status: 'published' })
      .sort('-enrollments')
      .limit(6)
      .populate('teacher', 'name');

    const testimonials = [
      {
        name: "Carlos Silva",
        course: "Desenvolvimento Web",
        text: "A plataforma transformou minha carreira! Consegui meu primeiro emprego como desenvolvedor após completar o curso.",
        rating: 5,
        photo: "/images/testimonials/1.jpg"
      },
      // ... mais depoimentos
    ];

    res.render('home', {
      user: req.user || null,
      featuredCourses,
      testimonials
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/500');
  }
};
