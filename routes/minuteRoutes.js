const express = require('express');
const router = express.Router();
const {
  getMinutes,
  getMinuteByMeetingId,
  createMinute,
  updateMinute,
  deleteMinute
} = require('../controllers/minuteController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const uploadMinuteImages = require('../middleware/uploadMiddleware');

// Get all minutes
router.get('/', authMiddleware, getMinutes);

// Get minute by meeting_id
router.get('/meeting/:meeting_id', authMiddleware, getMinuteByMeetingId);

// Create minute (Hanya Admin, mendukung upload file/kamera)
router.post('/', authMiddleware, roleMiddleware('Admin'), uploadMinuteImages, createMinute);

// Update minute (Hanya Admin, mendukung upload file/kamera)
router.put('/:id', authMiddleware, roleMiddleware('Admin'), uploadMinuteImages, updateMinute);

// Delete minute (Hanya Admin)
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), deleteMinute);

module.exports = router;