const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { bookAppointment, getMyAppointments, getAllAppointments, getDoctorAppointments, updateAppointmentStatus, cancelAppointment } = require('../controllers/appointmentController');

// Patient routes
router.post('/book', authMiddleware, bookAppointment);
router.get('/my', authMiddleware, getMyAppointments);
router.put('/:id/status', authMiddleware, updateAppointmentStatus);
router.put('/:id/cancel', authMiddleware, cancelAppointment);

// Doctor route
router.get('/doctor', authMiddleware, getDoctorAppointments);

// Admin route
router.get('/', authMiddleware, getAllAppointments);

module.exports = router;
