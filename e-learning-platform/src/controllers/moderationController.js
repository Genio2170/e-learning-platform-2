exports.getDashboardData = async (req, res) => {
  const [pending, stats, activity] = await Promise.all([
    CourseReview.find({ status: 'pending' })
      .populate('courseId reviewerId')
      .sort('-createdAt')
      .limit(50),

    CourseReview.aggregate([
      { $match: { status: { $ne: 'pending' } } },
      { $group: {
        _id: null,
        avgTime: { $avg: "$updatedAt - $createdAt" },
        rejectionRate: { 
          $avg: { 
            $cond: [{ $eq: ["$status", "rejected"] }, 1, 0 ] 
          } 
        }
      }}
    ]),

    User.aggregate([
      { $match: { role: 'reviewer' } },
      { $lookup: {
        from: 'coursereviews',
        localField: '_id',
        foreignField: 'reviewerId',
        as: 'reviews'
      }},
      { $project: {
        name: 1,
        lastActivity: { $max: "$reviews.updatedAt" },
        openReviews: { 
          $size: { 
            $filter: {
              input: "$reviews",
              as: "review",
              cond: { $eq: ["$$review.status", "pending"] }
            }
          }
        }
      }}
    ])
  ]);

  res.json({
    pendingReviews: pending,
    stats: stats[0] || {},
    reviewersActivity: activity
  });
};
