const mongoose = require('mongoose');
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  bio: { type: String, required: true },
  photo: { type: String, required: true },
  socialLinks: [{
    platform: { type: String, required: true },
    url: { type: String, required: true }
  }],
  isFounder: { type: Boolean, default: false },
  joinDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamMember',teamMemberSchema);