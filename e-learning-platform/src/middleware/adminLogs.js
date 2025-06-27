   const AdminLog = require('../models/AdminLog');

   exports.logAction = (action, target) => {
     return async (req, res, next) => {
       if (req.user.role === 'admin') {
         await AdminLog.create({
           admin: req.user._id,
           action,
           target,
           targetId: req.params.id,
           ip: req.ip,
           metadata: req.body
         });
       }
       next();
     };
   };
