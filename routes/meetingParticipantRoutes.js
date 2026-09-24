const express = require('express');
const router = express.Router();
const participantController = require('../controllers/meetingParticipantController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:meetingId/participants', authMiddleware, participantController.getParticipantsByMeeting);
router.post('/:meetingId/participants', authMiddleware, participantController.saveMeetingParticipants);
router.delete('/:meetingId/participants/:userId', authMiddleware, participantController.removeParticipant);

module.exports = router;