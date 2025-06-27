async function startReviewProcess(courseId, reviewerId) {
  // Criar registro de revisão
  const review = new CourseReview({
    courseId,
    reviewerId,
    status: 'pending'
  });

  // Mudar status do curso
  await Course.findByIdAndUpdate(courseId, { status: 'under_review' });

  // Notificar partes interessadas
  await Notification.create([
    {
      userId: reviewerId,
      type: 'review_assigned',
      metadata: { courseId }
    },
    {
      userId: course.teacher,
      type: 'review_started',
      metadata: { courseId, reviewerId }
    }
  ]);

  return review.save();
}

async function submitReview(reviewId, decision, comments) {
  const review = await CourseReview.findById(reviewId);
  const course = await Course.findById(review.courseId);

  review.status = decision;
  review.comments = comments;

  if (decision === 'approved') {
    course.status = 'published';
    await course.save();
  }

  await review.save();

  // Disparar webhook para notificações
  await sendReviewNotification(review, course);
}


async function moveToNextStep(courseId) {
  const flow = await ReviewFlow.findOne({ courseId });
  flow.currentStep++;

  if (flow.currentStep >= flow.steps.length) {
    flow.status = 'approved';
    await Course.findByIdAndUpdate(courseId, { status: 'published' });
  } else {
    await Notification.create({
      userId: await getNextReviewer(flow),
      type: 'review_step_assigned'
    });
  }

  await flow.save();
}


await notificationService.sendRoleNotification(
'admin',
  {
    type: 'moderation_required',
    title: 'Curso pendente de moderação',
    message: `Novo curso "${course.title}" aguarda revisão`,
    priority: 3,
    metadata: { courseId }
  }
);
