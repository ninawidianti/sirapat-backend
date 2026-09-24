const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;

    // Cek apakah token tersedia
    if (!authHeader) {
      return res.status(401).json({
        message: 'Akses ditolak. Silakan login terlebih dahulu.'
      });
    }

    // Format yang diharapkan:
    // Authorization: Bearer TOKEN
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Token tidak ditemukan.'
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Simpan data user dari token ke request
    req.user = decoded;

    // Lanjut ke controller berikutnya
    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Token tidak valid atau sudah kedaluwarsa.'
    });
  }
};

module.exports = authMiddleware;