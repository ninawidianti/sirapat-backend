const db = require('../models');
const Committee = db.Committee;
const User = db.User;

// Helper untuk menyertakan data anggota pada kueri Sequelize
const includeMembersOption = [
  {
    model: User,
    as: 'members',
    attributes: ['user_id', 'name', 'nip', 'bidang', 'jabatan'],
    through: { attributes: [] } // Menyembunyikan atribut tabel pivot
  }
];

// 1. Ambil Semua Kepanitiaan beserta Anggotanya
const getCommittees = async (req, res) => {
  try {
    const committees = await Committee.findAll({
      include: includeMembersOption,
      order: [['committee_id', 'DESC']]
    });

    res.status(200).json({
      message: 'Data kepanitiaan berhasil diambil',
      data: committees
    });
  } catch (error) {
    console.error('Error getCommittees:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data kepanitiaan', 
      error: error.message 
    });
  }
};

// 2. Ambil Detail Kepanitiaan Berdasarkan ID
const getCommitteeById = async (req, res) => {
  try {
    const { id } = req.params;
    const committee = await Committee.findByPk(id, {
      include: includeMembersOption
    });

    if (!committee) {
      return res.status(404).json({ message: 'Kepanitiaan tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Detail kepanitiaan berhasil diambil',
      data: committee
    });
  } catch (error) {
    console.error('Error getCommitteeById:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil detail kepanitiaan', 
      error: error.message 
    });
  }
};

// 3. Tambah Kepanitiaan Baru + Anggota
const createCommittee = async (req, res) => {
  try {
    const { name, description, userIds } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nama kepanitiaan wajib diisi' });
    }

    // Buat data kepanitiaan baru
    const committee = await Committee.create({ name, description });

    // Hubungkan anggota jika array userIds dikirimkan
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      await committee.setMembers(userIds);
    }

    // Fetch ulang data beserta relasi anggotanya agar response terisi lengkap
    const createdCommittee = await Committee.findByPk(committee.committee_id, {
      include: includeMembersOption
    });

    res.status(201).json({
      message: 'Kepanitiaan berhasil dibuat',
      data: createdCommittee
    });
  } catch (error) {
    console.error('Error createCommittee:', error);
    res.status(500).json({ 
      message: 'Gagal membuat kepanitiaan', 
      error: error.message 
    });
  }
};

// 4. Update Kepanitiaan & Anggota
const updateCommittee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, userIds } = req.body;

    const committee = await Committee.findByPk(id);
    if (!committee) {
      return res.status(404).json({ message: 'Kepanitiaan tidak ditemukan' });
    }

    // Perbarui data utama
    await committee.update({ 
      name: name !== undefined ? name : committee.name, 
      description: description !== undefined ? description : committee.description 
    });

    // Perbarui daftar anggota pada tabel pivot jika userIds dikirimkan
    if (userIds !== undefined && Array.isArray(userIds)) {
      await committee.setMembers(userIds);
    }

    // Fetch ulang data terbaru beserta relasi anggotanya
    const updatedCommittee = await Committee.findByPk(id, {
      include: includeMembersOption
    });

    res.status(200).json({
      message: 'Kepanitiaan berhasil diperbarui',
      data: updatedCommittee
    });
  } catch (error) {
    console.error('Error updateCommittee:', error);
    res.status(500).json({ 
      message: 'Gagal memperbarui kepanitiaan', 
      error: error.message 
    });
  }
};

// 5. Hapus Kepanitiaan
const deleteCommittee = async (req, res) => {
  try {
    const { id } = req.params;
    const committee = await Committee.findByPk(id);

    if (!committee) {
      return res.status(404).json({ message: 'Kepanitiaan tidak ditemukan' });
    }

    // Lepas relasi pivot terlebih dahulu jika perlu, lalu hapus record
    await committee.setMembers([]);
    await committee.destroy();

    res.status(200).json({ message: 'Kepanitiaan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteCommittee:', error);
    res.status(500).json({ 
      message: 'Gagal menghapus kepanitiaan', 
      error: error.message 
    });
  }
};

module.exports = {
  getCommittees,
  getCommitteeById,
  createCommittee,
  updateCommittee,
  deleteCommittee
};