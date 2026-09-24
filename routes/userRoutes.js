const express = require('express');
const router = express.Router();

const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  uploadUserSignature 
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const uploadSignature = require('../middleware/uploadSignatureMiddleware');

router.get('/', authMiddleware, roleMiddleware('Admin'), getUsers);
router.get('/:id', authMiddleware, roleMiddleware('Admin'), getUserById);

// Tambah user baru oleh Admin (bisa sekalian upload file TTD)
router.post(
  '/', 
  authMiddleware, 
  roleMiddleware('Admin'), 
  uploadSignature.single('signature'), 
  createUser
);

// Update user oleh Admin (bisa update file TTD)
router.put(
  '/:id', 
  authMiddleware, 
  roleMiddleware('Admin'), 
  uploadSignature.single('signature'), 
  updateUser
);

// Endpoint khusus agar user (Peserta/Admin) bisa upload TTD dari menu Profil sendiri
router.post(
  '/upload-signature', 
  authMiddleware, 
  uploadSignature.single('signature'), 
  uploadUserSignature
);

router.delete('/:id', authMiddleware, roleMiddleware('Admin'), deleteUser);

module.exports = router;