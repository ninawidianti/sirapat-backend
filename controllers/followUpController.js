const { FollowUp, FollowUpUpdate, Meeting, User } = require('../models');

// Helper function untuk melengkapi data PIC berdasarkan array of user_id
const attachPicsToFollowUps = async (followUps) => {
  const allUsers = await User.findAll({ attributes: ['user_id', 'name', 'email'] });
  const userMap = new Map(allUsers.map(u => [u.user_id, u]));

  return followUps.map(item => {
    const data = item.toJSON();
    let userIds = [];
    if (Array.isArray(data.user_id)) {
      userIds = data.user_id;
    } else if (typeof data.user_id === 'string') {
      try { userIds = JSON.parse(data.user_id); } catch (e) { userIds = [data.user_id]; }
    } else if (data.user_id) {
      userIds = [data.user_id];
    }

    data.pics = userIds.map(id => userMap.get(Number(id))).filter(Boolean);
    return data;
  });
};

// 1. Get All Follow-ups (Disertai Kode Rapat dan Parsing PIC)
const getAllFollowUps = async (req, res) => {
  try {
    const data = await FollowUp.findAll({
      include: [
        {
          model: Meeting,
          as: 'meeting',
          attributes: ['meeting_id', 'title', 'meeting_code'] // <--- Ambil Kode Rapat
        },
        {
          model: FollowUpUpdate,
          as: 'updates',
          order: [['updated_at', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Menghubungkan data PIC ke setiap item follow-up
    const result = await attachPicsToFollowUps(data);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error Detail Backend:', error);
    return res.status(500).json({
      message: 'Gagal mengambil data',
      error: error.message
    });
  }
};

// 2. Get Follow-up By Meeting ID
const getFollowUpsByMeetingId = async (req, res) => {
  try {
    const { meeting_id } = req.params;
    const followUps = await FollowUp.findAll({
      where: { meeting_id },
      include: [
        {
          model: Meeting,
          as: 'meeting',
          attributes: ['meeting_id', 'title', 'meeting_code']
        }
      ]
    });

    const result = await attachPicsToFollowUps(followUps);

    res.status(200).json({ message: 'Detail tindak lanjut berhasil diambil', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail tindak lanjut', error: error.message });
  }
};

// 3. Create Follow-up
const createFollowUp = async (req, res) => {
  try {
    const { meeting_id, task, user_id, deadline, priority, status } = req.body;
    const created_by = req.user.user_id || req.user.id;

    if (!meeting_id || !task || !user_id || !deadline) {
      return res.status(400).json({ message: 'meeting_id, task, user_id, dan deadline wajib diisi' });
    }

    const userIdsArray = Array.isArray(user_id) ? user_id : [user_id];

    const newFollowUp = await FollowUp.create({
      meeting_id,
      task,
      user_id: userIdsArray,
      deadline,
      priority: priority || 'Sedang',
      status: status || 'Belum Mulai',
      created_by
    });

    res.status(201).json({ message: 'Tindak lanjut berhasil dibuat', data: newFollowUp });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat tindak lanjut', error: error.message });
  }
};

// 4. Update Follow-up
const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { task, user_id, deadline, priority, status } = req.body;

    const followUp = await FollowUp.findByPk(id);
    if (!followUp) {
      return res.status(404).json({ message: 'Data tindak lanjut tidak ditemukan' });
    }

    let userIdsArray = followUp.user_id;
    if (user_id) {
      userIdsArray = Array.isArray(user_id) ? user_id : [user_id];
    }

    await followUp.update({
      task: task || followUp.task,
      user_id: userIdsArray,
      deadline: deadline || followUp.deadline,
      priority: priority || followUp.priority,
      status: status || followUp.status
    });

    res.status(200).json({ message: 'Tindak lanjut berhasil diperbarui', data: followUp });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui tindak lanjut', error: error.message });
  }
};

// 5. Delete Follow-up
const deleteFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const followUp = await FollowUp.findByPk(id);

    if (!followUp) {
      return res.status(404).json({ message: 'Data tindak lanjut tidak ditemukan' });
    }

    await followUp.destroy();
    res.status(200).json({ message: 'Tindak lanjut berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus tindak lanjut', error: error.message });
  }
};

module.exports = {
  getAllFollowUps,
  getFollowUpsByMeetingId,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp
};