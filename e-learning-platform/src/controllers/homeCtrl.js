const Course = require('../models/Course');
const Testimonial = require('../models/Testimonial');
const Post = require('../models/Post');

exports.getHomePage = async (req, res) => {
  try {
    const [featuredCourses, testimonials, posts] = await Promise.all([
      Course.find({ isFeatured: true })
        .limit(4)
        .select('title thumbnail price discountPrice averageRating reviewsCount'),
      
      Testimonial.aggregate([
        { $sample: { size: 3 } },
        {
          $lookup: {
            from: 'users',
            localField: 'student',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        {
          $project: {
            content: 1,
            rating: 1,
            course: 1,
            'student.name': 1,
            'student.photo': 1
          }
        }
      ]),
      
      Post.find()
        .sort('-createdAt')
        .limit(5)
        .populate('author', 'name photo')
    ]);

    res.render('home', {
      title: 'Página Inicial',
      featuredCourses,
      testimonials,
      posts,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/500', {
      title: 'Erro no Servidor'
    });
  }
};