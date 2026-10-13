const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { 
    careAssistant, recommendDoctorsHandler, appointmentAgent,
    appointmentPreparation, clinicalSummary, anomalyDetection,
    riskIndicator, followUp 
} = require('../controllers/aiController');

// Patient AI routes
router.post('/care-assistant', authMiddleware, careAssistant);
router.post('/recommend-doctors', authMiddleware, recommendDoctorsHandler);
router.post('/appointment-agent', authMiddleware, appointmentAgent);
router.post('/appointment-preparation', authMiddleware, appointmentPreparation);

// Doctor AI routes
router.post('/clinical-summary', authMiddleware, roleMiddleware('doctor', 'admin'), clinicalSummary);
router.get('/anomaly-detection/:patientId', authMiddleware, roleMiddleware('doctor', 'admin'), anomalyDetection);
router.get('/risk-indicator/:patientId', authMiddleware, roleMiddleware('doctor', 'admin'), riskIndicator);

// Follow-up
router.post('/follow-up', authMiddleware, followUp);

module.exports = router;
