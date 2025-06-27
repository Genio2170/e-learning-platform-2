exports.moderateContent = async (req, res) => {
  const pendingContent = await Content.find({ status: 'pending' })
    .populate('createdBy');

  res.render('admin/content/moderation', { content: pendingContent });
};

exports.approveContent = async (req, res) => {
  await Content.findByIdAndUpdate(req.params.id, { 
    status: 'published',
    reviewedBy: req.user._id 
  });
  req.flash('success', 'Conteúdo aprovado');
  res.redirect('back');
};
