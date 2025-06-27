const express = require('express');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { token, platform } = req.body;

  try {
    await UserDevice.findOneAndUpdate(
      { userId: req.user._id, token },
      { $set: { platform, lastActive: new Date() } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;