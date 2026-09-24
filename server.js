const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const meetingRoute = require('./routes/meetingRoute');
const meetingParticipantRoutes = require('./routes/meetingParticipantRoutes');
const minuteRoutes = require('./routes/minuteRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const followUpUpdateRoutes = require('./routes/followUpUpdateRoutes');
const committeeRoutes = require('./routes/committeeRoutes');

const app = express();

// 1. Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Static Folder Uploads dengan Cross-Origin Header
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));

// Test server
app.get('/', (req, res) => {
  res.json({
    message: 'Backend Sistem Notulensi Rapat berjalan!'
  });
});

// Test database
app.get('/test-db', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({
      message: 'Koneksi database berhasil!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Koneksi database gagal!',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoute);
app.use('/api/meetings', meetingParticipantRoutes);
app.use('/api/minutes', minuteRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/follow-up-updates', followUpUpdateRoutes);
app.use('/api/committees', committeeRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});