const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// Get all notifications for a specific user
router.get('/', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'email query param required' });

  try {
    const notifications = await Notification.find({ userEmail: email.toLowerCase().trim() })
      .sort({ createdAt: -1 }); // Newest first
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark a single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Cannot find notification' });

    notification.read = true;
    const updatedNotification = await notification.save();
    res.json(updatedNotification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all notifications as read for a specific user
router.patch('/mark-all-read', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'email query param required' });

  try {
    await Notification.updateMany(
      { userEmail: email.toLowerCase().trim(), read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
