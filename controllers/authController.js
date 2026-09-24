const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

const User = db.User;

const register = async (req, res) => {
  try {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('BODY:', req.body);

    const {
      name,
      nip,
      email,
      password,
      role,
      bidang,
      jabatan,
      phone
    } = req.body;

    // Cek apakah NIP sudah digunakan
    const existingNip = await User.findOne({
      where: { nip }
    });

    if (existingNip) {
      return res.status(400).json({
        message: 'NIP sudah terdaftar'
      });
    }

    // Cek apakah email sudah digunakan
    const existingEmail = await User.findOne({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user
    const user = await User.create({
      name,
      nip,
      email,
      password: hashedPassword,
      role: role || 'Peserta',
      bidang,
      jabatan,
      phone,
      status: 'Aktif'
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      data: {
        user_id: user.user_id,
        name: user.name,
        nip: user.nip,
        email: user.email,
        role: user.role,
        bidang: user.bidang,
        jabatan: user.jabatan,
        phone: user.phone,
        status: user.status
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Registrasi gagal',
      error: error.message
    });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah email diisi
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email dan password wajib diisi'
      });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({
      where: { email }
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({
        message: 'Email atau password salah'
      });
    }

    // Cek password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Email atau password salah'
      });
    }

    // Cek status akun
    if (user.status !== 'Aktif') {
      return res.status(403).json({
        message: 'Akun tidak aktif'
      });
    }

    // Buat JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    // Response
    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        nip: user.nip,
        email: user.email,
        role: user.role,
        bidang: user.bidang,
        jabatan: user.jabatan,
        phone: user.phone,
        status: user.status
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Login gagal',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login
};


