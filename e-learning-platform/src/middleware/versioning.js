const CourseVersion = require('../models/CourseVersion');

async function saveVersion(course, userId) {
  const lastVersion = await CourseVersion.findOne({ courseId: course._id })
    .sort('-versionNumber')
    .lean();

  const newVersion = new CourseVersion({
    courseId: course._id,
    versionNumber: lastVersion ? lastVersion.versionNumber + 1 : 1,
    data: course.toObject(),
    changedFields: course.modifiedPaths(),
    changedBy: userId
  });

  await newVersion.save();
}

// Middleware para cursos
courseSchema.pre('save', async function(next) {
  if (this.isModified()) {
    await saveVersion(this, this._update.$set?.updatedBy);
  }
  next();
});

// Modificar a função saveVersion para gerar diffs
async function generateDiff(previousVersion, currentCourse) {
  const diff = {};
  currentCourse.modifiedPaths().forEach(path => {
    diff[path] = {
      old: previousVersion?.data[path],
      new: currentCourse[path]
    };
  });
  return diff;
}


