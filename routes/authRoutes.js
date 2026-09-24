const express = require('express');

const router = express.Router();

const {
  register,
  login
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Anda berhasil mengakses halaman yang dilindungi.',
    user: req.user
  });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    message: 'Logout berhasil'
  });
});

router.get('/admin-test', authMiddleware, roleMiddleware('Admin'), (req, res) => {
  res.json({
    message: 'Selamat datang Admin. Anda memiliki akses ke halaman ini.',
    user: req.user
  });
});

module.exports = router;