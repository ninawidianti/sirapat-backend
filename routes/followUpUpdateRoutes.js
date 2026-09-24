const express = require('express');
const router = express.Router();
const {
  createFollowUpUpdate,
  getFollowUpUpdates
} = require('../controllers/followUpUpdateController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint Tambah Update
router.post('/', authMiddleware, createFollowUpUpdate);

// Endpoint Menampilkan Data Progress berdasarkan ID FollowUp (misal: /api/follow-up-updates/12)
router.get('/:follow_up_id', authMiddleware, getFollowUpUpdates);

module.exports = router;