const db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const User = db.User;

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['password']
      },
      order: [['user_id', 'ASC']]
    });

    res.status(200).json({
      message: 'Data user berhasil diambil',
      data: users
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Gagal mengambil data user',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: {
        exclude: ['password']
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Data user berhasil diambil',
      data: user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Gagal mengambil data user',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, nip, email, password, role, bidang, jabatan, phone } = req.body;

    if (!name || !nip || !email || !password || !bidang || !jabatan) {
      return res.status(400).json({ message: 'Data wajib harus diisi' });
    }

    const existingNip = await User.findOne({ where: { nip } });
    if (existingNip) return res.status(400).json({ message: 'NIP sudah terdaftar' });

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      nip,
      email,
      password: hashedPassword,
      role: role || 'Peserta',
      bidang,
      jabatan,
      phone: phone || null,
      status: 'Aktif',
      signature_url: req.file ? `/uploads/signatures/${req.file.filename}` : null
    });

    res.status(201).json({
      message: 'User berhasil ditambahkan',
      data: {
        user_id: user.user_id,
        name: user.name,
        nip: user.nip,
        email: user.email,
        role: user.role,
        bidang: user.bidang,
        jabatan: user.jabatan,
        phone: user.phone,
        status: user.status,
        signature_url: user.signature_url
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan user', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nip, email, password, role, bidang, jabatan, phone, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    if (nip && nip !== user.nip) {
      const existingNip = await User.findOne({ where: { nip } });
      if (existingNip) return res.status(400).json({ message: 'NIP sudah digunakan' });
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    const updateData = { name, nip, email, role, bidang, jabatan, phone, status };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      // Hapus TTD lama jika ada
      if (user.signature_url) {
        const oldPath = path.join(__dirname, '..', user.signature_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.signature_url = `/uploads/signatures/${req.file.filename}`;
    }

    await user.update(updateData);

    res.status(200).json({
      message: 'User berhasil diperbarui',
      data: {
        user_id: user.user_id,
        name: user.name,
        nip: user.nip,
        email: user.email,
        role: user.role,
        bidang: user.bidang,
        jabatan: user.jabatan,
        phone: user.phone,
        status: user.status,
        signature_url: user.signature_url
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui user', error: error.message });
  }
};

// Fungsi khusus bagi user untuk upload / ubah TTD profil mereka sendiri
const uploadUserSignature = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'File tanda tangan wajib diunggah' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Hapus file TTD lama jika ada
    if (user.signature_url) {
      const oldPath = path.join(__dirname, '..', user.signature_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const signaturePath = `/uploads/signatures/${req.file.filename}`;
    await user.update({ signature_url: signaturePath });

    res.status(200).json({
      message: 'Tanda tangan digital berhasil diperbarui',
      signature_url: signaturePath
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengunggah tanda tangan', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }

    await user.destroy();

    res.status(200).json({
      message: 'User berhasil dihapus'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Gagal menghapus user',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadUserSignature 
};