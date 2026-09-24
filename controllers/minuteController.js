const { Minute, Meeting, User } = require('../models');
const fs = require('fs');
const path = require('path');

// Helper untuk menghapus file lokal dari path/URL
const removeFiles = (fileUrls, req) => {
  if (!fileUrls) return;
  const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
  
  urls.forEach((fileUrl) => {
    if (!fileUrl) return;
    const relativePath = fileUrl.replace(`${req.protocol}://${req.get('host')}/`, '');
    const absolutePath = path.join(__dirname, '../', relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  });
};

// Helper untuk mengubah array file upload Multer menjadi Array Public URL
const getFileUrls = (files, req) => {
  if (!files || files.length === 0) return [];
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return files.map(file => `${baseUrl}/${file.path.replace(/\\/g, '/')}`);
};

// 1. Get All Minutes
const getMinutes = async (req, res) => {
  try {
    const minutes = await Minute.findAll({
      include: [
        {
          model: Meeting,
          as: 'meeting',
          attributes: ['meeting_id', 'title', 'date', 'location']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Data notulensi berhasil diambil',
      data: minutes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal mengambil data notulensi',
      error: error.message
    });
  }
};

// 2. Get Minute By Meeting ID
const getMinuteByMeetingId = async (req, res) => {
  try {
    const { meeting_id } = req.params;

    const minute = await Minute.findOne({
      where: { meeting_id },
      include: [
        {
          model: Meeting,
          as: 'meeting'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    if (!minute) {
      return res.status(404).json({ message: 'Notulensi rapat tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Detail notulensi berhasil diambil',
      data: minute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal mengambil detail notulensi',
      error: error.message
    });
  }
};

// 3. Create Minute
const createMinute = async (req, res) => {
  try {
    const { meeting_id, discussion, decisions } = req.body;
    const created_by = req.user.user_id || req.user.id;

    if (!meeting_id || !discussion || !decisions) {
      return res.status(400).json({ message: 'meeting_id, discussion, dan decisions wajib diisi' });
    }

    const existingMinute = await Minute.findOne({ where: { meeting_id } });
    if (existingMinute) {
      return res.status(400).json({ message: 'Notulensi untuk rapat ini sudah pernah dibuat' });
    }

    const invitation_img = getFileUrls(req.files?.invitation_img, req);
    const documentation_img = getFileUrls(req.files?.documentation_img, req);

    const newMinute = await Minute.create({
      meeting_id,
      discussion,
      decisions,
      invitation_img,
      documentation_img,
      created_by
    });

    res.status(201).json({
      message: 'Notulensi berhasil disimpan',
      data: newMinute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal membuat notulensi',
      error: error.message
    });
  }
};

// 4. Update Minute
const updateMinute = async (req, res) => {
  try {
    const { id } = req.params;
    const { discussion, decisions } = req.body;

    const minute = await Minute.findByPk(id);
    if (!minute) {
      return res.status(404).json({ message: 'Notulensi tidak ditemukan' });
    }

    let updatedData = {
      discussion: discussion || minute.discussion,
      decisions: decisions || minute.decisions,
    };

    if (req.files?.invitation_img) {
      removeFiles(minute.invitation_img, req);
      updatedData.invitation_img = getFileUrls(req.files.invitation_img, req);
    }

    if (req.files?.documentation_img) {
      removeFiles(minute.documentation_img, req);
      updatedData.documentation_img = getFileUrls(req.files.documentation_img, req);
    }

    await minute.update(updatedData);

    res.status(200).json({
      message: 'Notulensi berhasil diperbarui',
      data: minute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal memperbarui notulensi',
      error: error.message
    });
  }
};

// 5. Delete Minute
const deleteMinute = async (req, res) => {
  try {
    const { id } = req.params;

    const minute = await Minute.findByPk(id);
    if (!minute) {
      return res.status(404).json({ message: 'Notulensi tidak ditemukan' });
    }

    removeFiles(minute.invitation_img, req);
    removeFiles(minute.documentation_img, req);

    await minute.destroy();

    res.status(200).json({
      message: 'Notulensi berhasil dihapus'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal menghapus notulensi',
      error: error.message
    });
  }
};

module.exports = {
  getMinutes,
  getMinuteByMeetingId,
  createMinute,
  updateMinute,
  deleteMinute
};