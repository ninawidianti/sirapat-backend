const db = require('../models');

const MeetingParticipant = db.MeetingParticipant;
const User = db.User;
const Meeting = db.Meeting;
const Attendance = db.Attendance;

// Helper untuk mengonversi string tanggal dan waktu menjadi objek Date
const getMeetingStartDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  return new Date(`${dateStr}T${timeStr}`);
};

// 1. Get Participants By Meeting ID
exports.getParticipantsByMeeting = async (req, res) => {
  const { meetingId } = req.params;

  try {
    const meeting = await Meeting.findByPk(meetingId, {
      attributes: ['meeting_id', 'date', 'start_time']
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Data rapat tidak ditemukan.' });
    }

    const participants = await MeetingParticipant.findAll({
      where: { meeting_id: meetingId },
      include: [
        {
          model: User,
          as: 'user',
          // PERBAIKAN UTAMA: Masukkan 'signature_url' ke dalam daftar atribut yang di-fetch
          attributes: ['user_id', 'name', 'nip', 'email', 'role', 'bidang', 'jabatan', 'phone', 'status', 'signature_url']
        },
        {
          model: Attendance,
          as: 'attendance',
          attributes: ['attendance_status', 'notes', 'confirmation_time']
        }
      ],
      order: [['participant_id', 'ASC']]
    });

    const formattedData = participants.map((p) => ({
      participant_id: p.participant_id,
      meeting_id: p.meeting_id,
      user_id: p.user ? p.user.user_id : p.user_id,
      name: p.user ? p.user.name : '-',
      nip: p.user ? p.user.nip : '-',
      email: p.user ? p.user.email : '-',
      role: p.user ? p.user.role : '-',
      bidang: p.user ? p.user.bidang : '-',
      jabatan: p.user ? p.user.jabatan : '-',
      phone: p.user ? p.user.phone : '-',
      status: p.user ? p.user.status : '-',
      invitation_status: p.invitation_status,

      // PERBAIKAN UTAMA: Petakan signature_url ke objek JSON agar bisa dibaca oleh Frontend React
      signature_url: p.user ? p.user.signature_url : null,

      // Ambil data attendance_status dari tabel attendances
      status_kehadiran: p.attendance ? p.attendance.attendance_status : 'Belum Konfirmasi',
      attendance_status: p.attendance ? p.attendance.attendance_status : 'Belum Konfirmasi',
      notes: p.attendance ? p.attendance.notes : null,
      confirmation_time: p.attendance ? p.attendance.confirmation_time : null,

      created_at: p.created_at,
      updated_at: p.updated_at
    }));

    const startDateTime = getMeetingStartDateTime(meeting.date, meeting.start_time);

    return res.status(200).json({
      message: 'Data peserta rapat berhasil diambil',
      data: formattedData,
      startTime: startDateTime
    });
  } catch (error) {
    console.error('Error Get Participants:', error);
    return res.status(500).json({
      message: 'Gagal mengambil data peserta rapat.',
      error: error.message
    });
  }
};

// 2. Bulk Save / Sync Participants
exports.saveMeetingParticipants = async (req, res) => {
  const { meetingId } = req.params;
  const { userIds } = req.body;

  try {
    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan.' });
    }

    const startDateTime = getMeetingStartDateTime(meeting.date, meeting.start_time);
    const currentTime = new Date();

    if (startDateTime && currentTime >= startDateTime) {
      return res.status(400).json({
        message: 'Rapat telah dimulai. Anda tidak dapat merubah peserta rapat lagi.'
      });
    }

    const validUserIds = Array.isArray(userIds) ? userIds.map((id) => Number(id)) : [];

    const existingParticipants = await MeetingParticipant.findAll({
      where: { meeting_id: meetingId }
    });

    const existingUserIds = existingParticipants.map((p) => p.user_id);

    const userIdsToAdd = validUserIds.filter((id) => !existingUserIds.includes(id));
    const userIdsToRemove = existingUserIds.filter((id) => !validUserIds.includes(id));

    if (userIdsToAdd.length > 0) {
      const newEntries = userIdsToAdd.map((userId) => ({
        meeting_id: Number(meetingId),
        user_id: userId,
        invitation_status: 'Diundang',
        status_kehadiran: 'Belum Hadir'
      }));
      await MeetingParticipant.bulkCreate(newEntries);
    }

    if (userIdsToRemove.length > 0) {
      await MeetingParticipant.destroy({
        where: {
          meeting_id: meetingId,
          user_id: userIdsToRemove
        }
      });
    }

    return res.status(200).json({ message: 'Berhasil memperbarui data peserta!' });
  } catch (error) {
    console.error('Error Save Participants:', error);
    return res.status(500).json({
      message: 'Gagal menyimpan peserta rapat.',
      error: error.message
    });
  }
};

// 3. Remove 1 Participant
exports.removeParticipant = async (req, res) => {
  const { meetingId, userId } = req.params;

  try {
    const meeting = await Meeting.findByPk(meetingId);
    if (meeting) {
      const startDateTime = getMeetingStartDateTime(meeting.date, meeting.start_time);
      const currentTime = new Date();

      if (startDateTime && currentTime >= startDateTime) {
        return res.status(400).json({
          message: 'Akses hapus ditutup karena jam rapat sudah dimulai.'
        });
      }
    }

    const deletedCount = await MeetingParticipant.destroy({
      where: {
        meeting_id: meetingId,
        user_id: userId
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Peserta tidak ditemukan pada rapat ini.' });
    }

    return res.status(200).json({ message: 'Peserta berhasil dihapus dari rapat!' });
  } catch (error) {
    console.error('Error Remove Participant:', error);
    return res.status(500).json({
      message: 'Gagal menghapus peserta.',
      error: error.message
    });
  }
};