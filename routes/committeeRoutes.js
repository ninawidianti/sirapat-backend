const express = require('express');
const router = express.Router();
const committeeController = require('../controllers/committeeController');

// 💡 Sesuaikan nama file dengan middleware yang kamu miliki (misal: authMiddleware.js)
const authMiddleware = require('../middleware/authMiddleware'); 

router.get('/', authMiddleware, committeeController.getCommittees);
router.get('/:id', authMiddleware, committeeController.getCommitteeById);
router.post('/', authMiddleware, committeeController.createCommittee);
router.put('/:id', authMiddleware, committeeController.updateCommittee);
router.delete('/:id', authMiddleware, committeeController.deleteCommittee);

module.exports = router;