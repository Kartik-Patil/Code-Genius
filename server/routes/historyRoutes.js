const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  saveHistory,
  getHistory,
  deleteHistory,
} = require('../controllers/historyController');

const router = express.Router();

router.use(verifyToken);

router.post('/', saveHistory);
router.get('/', getHistory);
router.delete('/:id', deleteHistory);

module.exports = router;
