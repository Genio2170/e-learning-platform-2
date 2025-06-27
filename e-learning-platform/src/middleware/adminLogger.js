const AdminLog = require('../models/AdminLog');

const logAdminAction = (action) => {
  return async (req, res, next) => {
    if (req.user?.role === 'admin') {
      try {
        await AdminLog.create({
          admin: req.user._id,
          action,
          target: req.params.id || null,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            method: req.method,
            path: req.path,
            body: action.includes('modified') ? req.body : undefined
          }
        });
      } catch (err) {
        console.error('Log error:', err);
      }
    }
    next();
  };
};

module.exports = logAdminAction;
