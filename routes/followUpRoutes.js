const express = require('express');
const router = express.Router();
const {
  getAllFollowUps,
  getFollowUpsByMeetingId,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp
} = require('../controllers/followUpController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getAllFollowUps);
router.get('/meeting/:meeting_id', authMiddleware, getFollowUpsByMeetingId);
router.post('/', authMiddleware, roleMiddleware('Admin'), createFollowUp);
router.put('/:id', authMiddleware, roleMiddleware('Admin'), updateFollowUp);
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), deleteFollowUp);

module.exports = router;