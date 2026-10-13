const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

router.get('/admin', authMiddleware, roleMiddleware('admin'), getAnalytics);

module.exports = router;
