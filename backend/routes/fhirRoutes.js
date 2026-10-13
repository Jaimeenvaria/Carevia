const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getPatient, getObservations, getAppointments } = require('../controllers/fhirController');

// FHIR-ready integration abstraction endpoints
router.get('/patients/:id', authMiddleware, getPatient);
router.get('/patients/:id/observations', authMiddleware, getObservations);
router.get('/patients/:id/appointments', authMiddleware, getAppointments);

module.exports = router;
