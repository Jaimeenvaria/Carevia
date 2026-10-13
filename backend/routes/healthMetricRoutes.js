const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addHealthMetric, getHealthMetrics, getHealthTrends } = require('../controllers/healthMetricController');

router.post('/', authMiddleware, addHealthMetric);
router.get('/:patientId', authMiddleware, getHealthMetrics);
router.get('/:patientId/trends', authMiddleware, getHealthTrends);

module.exports = router;
