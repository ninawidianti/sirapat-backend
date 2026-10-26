const express = require('express');
const router = express.Router();
const {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  confirmAttendance,
  requestApproval,
  approveMeeting,
  rejectMeeting,
  getPendingApprovalMeetings,
  updateMeetingStatus
} = require('../controllers/meetingController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route update status rapat (Admin & Pimpinan)
router.patch('/:id/status', authMiddleware, roleMiddleware('Admin', 'Pimpinan', 'admin', 'pimpinan'), updateMeetingStatus);

// Get all meetings (Peserta: terundang saja, Admin & Pimpinan: semua rapat)
router.get('/', authMiddleware, getMeetings);

// Get daftar rapat yang menunggu persetujuan (Khusus Pimpinan & Admin)
router.get('/pending-approval', authMiddleware, roleMiddleware('Pimpinan', 'Admin', 'pimpinan', 'admin'), getPendingApprovalMeetings);

// Get meeting detail (Semua user terautentikasi)
router.get('/:id', authMiddleware, getMeetingById);

// Create meeting (Hanya Admin)
router.post('/', authMiddleware, roleMiddleware('Admin', 'admin'), createMeeting);

// Update meeting (Hanya Admin)
router.put('/:id', authMiddleware, roleMiddleware('Admin', 'admin'), updateMeeting);

// Delete meeting (Hanya Admin)
router.delete('/:id', authMiddleware, roleMiddleware('Admin', 'admin'), deleteMeeting);

// Admin mengajukan dokumen rapat ke Pimpinan (Mendukung POST & PUT)
router.post('/:id/request-approval', authMiddleware, roleMiddleware('Admin', 'admin'), requestApproval);
router.put('/:id/request-approval', authMiddleware, roleMiddleware('Admin', 'admin'), requestApproval);

// Pimpinan Menyetujui Dokumen Rapat (ACC & TTD) (Mendukung POST & PUT)
router.post('/:id/approve', authMiddleware, roleMiddleware('Pimpinan', 'pimpinan'), approveMeeting);
router.put('/:id/approve', authMiddleware, roleMiddleware('Pimpinan', 'pimpinan'), approveMeeting);

// Pimpinan Menolak / Minta Revisi Dokumen Rapat (Mendukung POST & PUT)
router.post('/:id/reject', authMiddleware, roleMiddleware('Pimpinan', 'pimpinan'), rejectMeeting);
router.put('/:id/reject', authMiddleware, roleMiddleware('Pimpinan', 'pimpinan'), rejectMeeting);

// Konfirmasi Kehadiran (Semua User/Peserta yang login)
router.post('/:meeting_id/confirm-attendance', authMiddleware, confirmAttendance);

module.exports = router;