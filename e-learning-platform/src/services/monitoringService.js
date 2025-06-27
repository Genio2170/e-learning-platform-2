const os = require('os');
const mongoose = require('mongoose');

exports.getSystemStats = async () => {
  return {
    timestamp: new Date(),
    cpu: os.loadavg()[0],
    memory: {
      total: os.totalmem(),
      used: os.totalmem() - os.freemem()
    },
    db: {
      connections: mongoose.connections.length,
      collections: await mongoose.connection.db.listCollections().toArray().length
    },
    users: await mongoose.model('User').countDocuments(),
    courses: await mongoose.model('Course').countDocuments()
  };
};
