exports.viewLogs = async (req, res) => {
  const logs = await AdminLog.find()
    .populate('admin', 'name email')
    .sort('-createdAt')
    .limit(100);
	
  res.render('admin/logs/list', { logs });
};
