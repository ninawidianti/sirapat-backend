'use strict';

const { Meeting, User, MeetingParticipant, Attendance, Minute } = require('../models');
const { Op } = require('sequelize');

// Helper untuk generate kode rapat otomatis (RPT-2026-001)
const generateMeetingCode = async () => {
  const year = new Date().getFullYear();

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

// Helper untuk memperbarui status rapat yang sudah lewat
const autoUpdateExpiredMeetings = async () => {
  try {
    const now = new Date();

    const scheduledMeetings = await Meeting.findAll({
      where: { status: 'Terjadwal' },
      attributes: ['meeting_id', 'date', 'end_time']
    });

    const expiredIds = scheduledMeetings
      .filter((m) => {
        const endDateTime = new Date(`${m.date}T${m.end_time}`);
        return endDateTime < now;
      })
      .map((m) => m.meeting_id);

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

// 1. Get All Meetings
const getMeetings = async (req, res) => {
  try {
    await autoUpdateExpiredMeetings();

    const userId = req.user.user_id || req.user.id;
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';

    const isAdminOrPimpinan = userRole === 'admin' || userRole === 'pimpinan';

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

    if (!isAdminOrPimpinan) {
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
        },
        {
          model: User,
          as: 'approver',
          attributes: ['user_id', 'name', 'nip', 'jabatan']
        },
        {
          model: Minute,
          as: 'minute',
          required: false,
          attributes: ['minutes_id', 'discussion', 'decisions', 'invitation_img', 'documentation_img', 'created_at']
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'ASC']]
    });

    const formattedMeetings = meetings.map((m) => {
      const participant = m.participants ? m.participants.find((p) => p.user_id === userId) : null;
      const minuteData = m.minute || null;

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
        approval_status: m.approval_status || 'Draft',
        approved_by: m.approved_by,
        approved_at: m.approved_at,
        approver: m.approver,
        created_at: m.created_at,
        creator: m.creator,
        minutes_id: minuteData ? minuteData.minutes_id : null,
        has_minute: Boolean(minuteData && minuteData.minutes_id),
        minute_data: minuteData,
        user_participant_id: participant ? participant.participant_id : null,
        attendance_status: participant && participant.attendance ? participant.attendance.attendance_status : 'Belum Konfirmasi'
      };
    });

    res.status(200).json({
      message: 'Data rapat berhasil diambil',
      data: formattedMeetings
    });
  } catch (error) {
    console.error('Error getMeetings:', error);
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
        },
        {
          model: User,
          as: 'approver',
          attributes: ['user_id', 'name', 'nip', 'jabatan', 'signature_url']
        },
        {
          model: Minute,
          as: 'minute',
          required: false,
          attributes: ['minutes_id', 'discussion', 'decisions', 'invitation_img', 'documentation_img', 'created_at']
        }
      ]
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }

    const meetingJSON = meeting.toJSON();
    meetingJSON.has_minute = Boolean(meeting.minute && meeting.minute.minutes_id);
    meetingJSON.minutes_id = meeting.minute ? meeting.minute.minutes_id : null;

    res.status(200).json({
      message: 'Detail rapat berhasil diambil',
      data: meetingJSON
    });
  } catch (error) {
    console.error('Error getMeetingById:', error);
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

    if (!title || !agenda || !date || !start_time || !end_time || !location) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const meeting_code = await generateMeetingCode();
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
      approval_status: 'Draft',
      created_by
    });

    res.status(201).json({
      message: 'Rapat berhasil dibuat',
      data: newMeeting
    });
  } catch (error) {
    console.error('Error createMeeting:', error);
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
    console.error('Error updateMeeting:', error);
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
    console.error('Error deleteMeeting:', error);
    res.status(500).json({
      message: 'Gagal menghapus rapat',
      error: error.message
    });
  }
};

// 6. Confirm Attendance
const confirmAttendance = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const { meeting_id } = req.params;
    const { status, notes } = req.body;

    const participant = await MeetingParticipant.findOne({
      where: { meeting_id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({
        message: 'Anda tidak terdaftar sebagai peserta pada rapat ini'
      });
    }

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
    console.error('Error confirmAttendance:', error);
    res.status(500).json({
      message: 'Gagal memproses konfirmasi kehadiran',
      error: error.message
    });
  }
};

// 7. Admin Mengajukan Dokumen Rapat ke Pimpinan
const requestApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findByPk(id, {
      include: [
        {
          model: Minute,
          as: 'minute',
          required: false,
          attributes: ['minutes_id']
        }
      ]
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }

    if (!meeting.minute || !meeting.minute.minutes_id) {
      return res.status(400).json({
        message: 'Pengajuan gagal. Notulensi rapat belum diisi!'
      });
    }

    await meeting.update({
      approval_status: 'Pending_Approval'
    });

    res.status(200).json({
      message: 'Dokumen rapat berhasil diajukan ke Pimpinan',
      data: meeting
    });
  } catch (error) {
    console.error('Error requestApproval:', error);
    res.status(500).json({
      message: 'Gagal mengajukan persetujuan rapat',
      error: error.message
    });
  }
};

// 8. Pimpinan Menyetujui Dokumen Rapat
const approveMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const pimpinanId = req.user.user_id || req.user.id;

    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }

    await meeting.update({
      approval_status: 'Approved',
      approved_by: pimpinanId,
      approved_at: new Date()
    });

    res.status(200).json({
      message: 'Dokumen rapat berhasil disetujui dan ditandatangani oleh Pimpinan',
      data: meeting
    });
  } catch (error) {
    console.error('Error approveMeeting:', error);
    res.status(500).json({
      message: 'Gagal menyetujui dokumen rapat',
      error: error.message
    });
  }
};

// 9. Pimpinan Menolak Dokumen Rapat (Rejected)
const rejectMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejected_reason } = req.body;

    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }

    await meeting.update({
      approval_status: 'Rejected',
      rejected_reason: rejected_reason || null
    });

    res.status(200).json({
      message: 'Dokumen rapat ditolak/dikembalikan ke Admin untuk direvisi',
      data: meeting
    });
  } catch (error) {
    console.error('Error rejectMeeting:', error);
    res.status(500).json({
      message: 'Gagal menolak dokumen rapat',
      error: error.message
    });
  }
};

// 10. Get Daftar Rapat Menunggu Persetujuan Pimpinan
const getPendingApprovalMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: { approval_status: 'Pending_Approval' },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: Minute,
          as: 'minute',
          required: false,
          attributes: ['minutes_id', 'discussion', 'decisions']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      message: 'Data rapat menunggu persetujuan berhasil diambil',
      data: meetings
    });
  } catch (error) {
    console.error('Error getPendingApprovalMeetings:', error);
    res.status(500).json({
      message: 'Gagal mengambil data persetujuan rapat',
      error: error.message
    });
  }
};

// 11. Update Status Fleksibel
const updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_status, rejected_reason } = req.body;

    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Rapat tidak ditemukan' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (approval_status) {
      updateData.approval_status = approval_status;
      if (approval_status === 'Approved') {
        updateData.approved_by = req.user.user_id || req.user.id;
        updateData.approved_at = new Date();
      } else if (approval_status === 'Rejected') {
        updateData.rejected_reason = rejected_reason || null;
      }
    }

    await meeting.update(updateData);

    res.status(200).json({
      message: 'Status rapat berhasil diperbarui',
      data: meeting
    });
  } catch (error) {
    console.error('Error updateMeetingStatus:', error);
    res.status(500).json({
      message: 'Gagal memperbarui status rapat',
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
  confirmAttendance,
  requestApproval,
  approveMeeting,
  rejectMeeting,
  getPendingApprovalMeetings,
  updateMeetingStatus
};