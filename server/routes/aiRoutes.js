const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  detectErrorsHandler,
  suggestHandler,
  explainHandler,
  runCodeHandler,
} = require('../controllers/aiController');

const router = express.Router();

router.use(verifyToken);

router.post('/detect-errors', detectErrorsHandler);
router.post('/suggest', suggestHandler);
router.post('/explain', explainHandler);
router.post('/run', runCodeHandler);

module.exports = router;
