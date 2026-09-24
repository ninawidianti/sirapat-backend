const { Meeting, User, MeetingParticipant, Attendance } = require('../models');
const { Op } = require('sequelize');

// Helper untuk generate kode rapat otomatis yang aman dari bentrok (misal: RPT-2026-001)
const generateMeetingCode = async () => {
  const year = new Date().getFullYear();

  // Cari 1 rapat terakhir
  const lastMeeting = await Meeting.findOne({
    order: [['created_at', 'DESC']]
  });

  let sequence = 1;

  if (lastMeeting && lastMeeting.meeting_code) {
    const parts = lastMeeting.meeting_code.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
  }

  const paddedSequence = String(sequence).padStart(3, '0');
  return `RPT-${year}-${paddedSequence}`;
};

// Helper untuk memperbarui status rapat yang sudah lewat secara otomatis
const autoUpdateExpiredMeetings = async () => {
  try {
    const now = new Date();

    // 1. Ambil rapat yang statusnya 'Terjadwal'
    const scheduledMeetings = await Meeting.findAll({
      where: { status: 'Terjadwal' },
      attributes: ['meeting_id', 'date', 'end_time']
    });

    // 2. Filter rapat yang tgl + jam selesainya sudah lewat
    const expiredIds = scheduledMeetings
      .filter((m) => {
        const endDateTime = new Date(`${m.date}T${m.end_time}`);
        return endDateTime < now;
      })
      .map((m) => m.meeting_id);

    // 3. Update status rapat yang lewat menjadi 'Selesai'
    if (expiredIds.length > 0) {
      await Meeting.update(
        { status: 'Selesai' },
        {
          where: {
            meeting_id: {
              [Op.in]: expiredIds
            }
          }
        }
      );
    }
  } catch (error) {
    console.error('Error auto update status rapat:', error);
  }
};

// 1. Get All Meetings (Khusus Rapat di mana User terdaftar sebagai Peserta)
// 1. Get All Meetings (Admin melihat semua rapat, User biasa hanya melihat rapat terundang)
const getMeetings = async (req, res) => {
  try {
    await autoUpdateExpiredMeetings();

    const userId = req.user.user_id || req.user.id;
    const userRole = req.user.role; // Membaca role dari token/middleware auth

    // Pengecekan role admin (penulisan huruf besar/kecil disesuaikan dengan database kamu)
    const isAdmin = userRole && userRole.toLowerCase() === 'admin';

    // Jika Peserta biasa: required = true (INNER JOIN, hanya tampilkan rapat terundang)
    const includeParticipantOptions = {
      model: MeetingParticipant,
      as: 'participants',
      include: [
        {
          model: Attendance,
          as: 'attendance'
        }
      ]
    };

    if (!isAdmin) {
      includeParticipantOptions.where = { user_id: userId };
      includeParticipantOptions.required = true;
    } else {
      includeParticipantOptions.required = false;
    }

    const meetings = await Meeting.findAll({
      include: [
        includeParticipantOptions,
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'name', 'email']
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'ASC']]
    });

    // Mapping output agar sesuai dengan kebutuhan React Frontend
    const formattedMeetings = meetings.map((m) => {
      // Cari data partisipasi khusus untuk user yang sedang login
      const participant = m.participants ? m.participants.find((p) => p.user_id === userId) : null;

      return {
        meeting_id: m.meeting_id,
        meeting_code: m.meeting_code,
        title: m.title,
        agenda: m.agenda,
        description: m.description,
        date: m.date,
        start_time: m.start_time,
        end_time: m.end_time,
        location: m.location,
        status: m.status,
        created_at: m.created_at,
        creator: m.creator,
        user_participant_id: participant ? participant.participant_id : null,
        attendance_status: participant && participant.attendance ? participant.attendance.attendance_status : 'Belum Konfirmasi'
      };
    });

    res.status(200).json({
      message: 'Data rapat berhasil diambil',
      data: formattedMeetings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal mengambil data rapat',
      error: error.message
    });
  }
};

// 2. Get Meeting By ID
const getMeetingById = async (req, res) => {
  try {
    await autoUpdateExpiredMeetings();

    const { id } = req.params;
    const meeting = await Meeting.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Detail rapat berhasil diambil',
      data: meeting
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal mengambil detail rapat',
      error: error.message
    });
  }
};

// 3. Create Meeting
const createMeeting = async (req, res) => {
  try {
    const { title, agenda, date, start_time, end_time, location, description } = req.body;

    // Validasi field wajib
    if (!title || !agenda || !date || !start_time || !end_time || !location) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Auto-generate kode rapat
    const meeting_code = await generateMeetingCode();

    // Mengambil user_id secara fleksibel (mencakup req.user.user_id atau req.user.id)
    const created_by = req.user.user_id || req.user.id;

    if (!created_by) {
      return res.status(400).json({ message: 'User ID tidak ditemukan dalam token' });
    }

    const newMeeting = await Meeting.create({
      meeting_code,
      title,
      agenda,
      date,
      start_time,
      end_time,
      location,
      description: description || null,
      status: 'Terjadwal',
      created_by
    });

    res.status(201).json({
      message: 'Rapat berhasil dibuat',
      data: newMeeting
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal membuat rapat',
      error: error.message
    });
  }
};

// 4. Update Meeting
const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, agenda, date, start_time, end_time, location, description, status } = req.body;

    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }

    await meeting.update({
      title: title || meeting.title,
      agenda: agenda || meeting.agenda,
      date: date || meeting.date,
      start_time: start_time || meeting.start_time,
      end_time: end_time || meeting.end_time,
      location: location || meeting.location,
      description: description !== undefined ? description : meeting.description,
      status: status || meeting.status
    });

    res.status(200).json({
      message: 'Data rapat berhasil diperbarui',
      data: meeting
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal memperbarui rapat',
      error: error.message
    });
  }
};

// 5. Delete Meeting
const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }

    await meeting.destroy();

    res.status(200).json({
      message: 'Rapat berhasil dihapus'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal menghapus rapat',
      error: error.message
    });
  }
};

// 6. Confirm Attendance (Konfirmasi Kehadiran)
const confirmAttendance = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const { meeting_id } = req.params;
    const { status, notes } = req.body;

    // Pastikan user terdaftar sebagai peserta rapat ini
    const participant = await MeetingParticipant.findOne({
      where: { meeting_id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({
        message: 'Anda tidak terdaftar sebagai peserta pada rapat ini'
      });
    }

    // Cek atau buat data presensi pada tabel attendances
    let attendance = await Attendance.findOne({
      where: { participant_id: participant.participant_id }
    });

    if (attendance) {
      await attendance.update({
        attendance_status: status || 'Hadir',
        confirmation_time: new Date(),
        notes: notes || null
      });
    } else {
      attendance = await Attendance.create({
        participant_id: participant.participant_id,
        attendance_status: status || 'Hadir',
        confirmation_time: new Date(),
        notes: notes || null
      });
    }

    res.status(200).json({
      message: 'Konfirmasi kehadiran berhasil disimpan',
      data: attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal memproses konfirmasi kehadiran',
      error: error.message
    });
  }
};

module.exports = {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  confirmAttendance
};
