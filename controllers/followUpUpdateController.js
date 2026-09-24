const { FollowUpUpdate, FollowUp, User, sequelize } = require('../models');

// 1. Fungsi Tambah Update Progress
const createFollowUpUpdate = async (req, res) => {
  const t = await sequelize.transaction(); // Menggunakan transaksi database

  try {
    const { follow_up_id, status, progress, description } = req.body;
    const user_id = req.user.user_id || req.user.id;

    if (!follow_up_id) {
      return res.status(400).json({ message: 'follow_up_id wajib diisi' });
    }

    // A. Catat riwayat ke tabel follow_up_updates
    const newUpdate = await FollowUpUpdate.create(
      {
        follow_up_id,
        user_id,
        status: status || 'Belum Mulai',
        progress: progress || 0,
        description: description || ''
      },
      { transaction: t }
    );

    // B. Update status utama di tabel follow_ups
    const followUp = await FollowUp.findByPk(follow_up_id, { transaction: t });
    if (!followUp) {
      await t.rollback();
      return res.status(404).json({ message: 'Data FollowUp tidak ditemukan' });
    }

    await followUp.update(
      { status: status || followUp.status },
      { transaction: t }
    );

    await t.commit(); // Commit transaksi jika semua berhasil

    // C. Ambil ulang data yang baru dibuat beserta relasi User (agar frontend bisa langsung render nama user)
    const resultData = await FollowUpUpdate.findByPk(newUpdate.update_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email'] // Sesuaikan dengan kolom tabel User kamu
        }
      ]
    });

    return res.status(201).json({
      message: 'Progress tindak lanjut berhasil diperbarui',
      data: resultData
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: 'Gagal memperbarui progress',
      error: error.message
    });
  }
};

// 2. Fungsi Ambil Riwayat Progress per FollowUp (Untuk Menampilkan ke Tabel Frontend)
const getFollowUpUpdates = async (req, res) => {
  try {
    const { follow_up_id } = req.params;

    const updates = await FollowUpUpdate.findAll({
      where: { follow_up_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email']
        }
      ],
      order: [['updated_at', 'DESC']] // Urutkan dari update terbaru
    });

    return res.status(200).json({
      message: 'Berhasil mengambil riwayat progress',
      data: updates
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Gagal mengambil data progress',
      error: error.message
    });
  }
};

module.exports = { createFollowUpUpdate, getFollowUpUpdates };