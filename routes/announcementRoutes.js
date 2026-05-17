const express = require('express');
const router = express.Router();
const { Announcement, College } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get all announcements (For students and guests)
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      include: [{ model: College, attributes: ['name', 'city'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new announcement (For College Admins)
router.post('/', authMiddleware, roleMiddleware('college'), async (req, res) => {
  try {
    const { title, message } = req.body;
    const college_id = req.user.id;

    const announcement = await Announcement.create({
      college_id,
      title,
      message
    });

    res.status(201).json({ success: true, message: 'Announcement posted successfully', data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete announcement (For College Admins)
router.delete('/:id', authMiddleware, roleMiddleware('college'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.destroy({
      where: { announcement_id: id, college_id: req.user.id }
    });

    if (!deleted) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
