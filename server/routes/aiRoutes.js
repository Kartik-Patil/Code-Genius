const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  detectErrorsHandler,
  suggestHandler,
  explainHandler,
} = require('../controllers/aiController');

const router = express.Router();

router.use(verifyToken);

router.post('/detect-errors', detectErrorsHandler);
router.post('/suggest', suggestHandler);
router.post('/explain', explainHandler);

module.exports = router;
