const express = require('express');
const router = express.Router();
const {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  confirmAttendance // 1. Impor fungsi confirmAttendance dari controller
} = require('../controllers/meetingController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get all meetings (Hanya menampilkan rapat tempat user terdaftar sebagai peserta)
router.get('/', authMiddleware, getMeetings);

// Get meeting detail (Bisa diakses user yang sudah login)
router.get('/:id', authMiddleware, getMeetingById);

// Create meeting (Hanya Admin)
router.post('/', authMiddleware, roleMiddleware('Admin'), createMeeting);

// Update meeting (Hanya Admin)
router.put('/:id', authMiddleware, roleMiddleware('Admin'), updateMeeting);

// Delete meeting (Hanya Admin)
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), deleteMeeting);

// 2. Route Konfirmasi Kehadiran (Dapat diakses oleh User/Peserta yang sudah login)
router.post('/:meeting_id/confirm-attendance', authMiddleware, confirmAttendance);

module.exports = router;