
exports.getPlatformMetrics = async (req, res) => {
  try {
    // Métricas básicas
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isApproved: true });
    const totalCourses = await Course.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Conversão (visitas -> cadastros -> compras)
    const conversionData = await Analytics.aggregate([
      {
        $facet: {
          visits: [
            { $match: { event: 'page_view' } },
            { $count: 'count' }
          ],
          signups: [
            { $match: { event: 'signup' } },
            { $count: 'count' }
          ],
          purchases: [
            { $match: { event: 'purchase' } },
            { $count: 'count' }
          ]
        }
      }
    ]);
    
    // Cursos mais populares
    const popularCourses = await Course.aggregate([
      {
        $project: {
          title: 1,
          studentsCount: { $size: '$studentsEnrolled' },
          revenue: {
            $multiply: [
              { $size: '$studentsEnrolled' },
              { $ifNull: ['$discountPrice', '$price'] }
            ]
          }
        }
      },
      { $sort: { studentsCount: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      totalRevenue: totalRevenue[0]?.total || 0,
      conversionRates: {
        visitToSignup: conversionData[0].signups[0]?.count / conversionData[0].visits[0]?.count || 0,
        signupToPurchase: conversionData[0].purchases[0]?.count / conversionData[0].signups[0]?.count || 0
      },
      popularCourses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};