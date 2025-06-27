router.get('/:versionId/diff', async (req, res) => {
  const version = await CourseVersion.findById(req.params.versionId);
  const previous = await CourseVersion.findOne({
    courseId: version.courseId,
    versionNumber: version.versionNumber - 1
  });

  res.json({
    changes: Object.keys(version.changedFields).map(field => ({
      field,
      previous: previous?.data[field],
      current: version.data[field]
    }))
  });
});


module.exports = router;