const express = require('express');
const Hunter = require('../models/Hunter');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes below require auth
router.use(authMiddleware);

// GET /api/data — load hunter data
router.get('/', async (req, res) => {
  try {
    let hunter = await Hunter.findOne({ userId: req.userId });
    if (!hunter) {
      // Create fresh hunter if somehow missing
      hunter = await Hunter.create({ userId: req.userId });
    }
    res.json(hunter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// POST /api/data — save entire hunter state
router.post('/', async (req, res) => {
  try {
    const update = req.body;
    // Never allow userId override from client
    delete update.userId;
    delete update._id;

    const hunter = await Hunter.findOneAndUpdate(
      { userId: req.userId },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json({ ok: true, updatedAt: hunter.updatedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

module.exports = router;
