const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { 
    listUsers, updateUserStatus, 
    getDoctors, addDoctor, updateDoctor, deleteDoctor, toggleDoctorActive,
    listAppointments, updateAppointmentStatus,
    getAuditLogs 
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(authMiddleware, roleMiddleware('admin'));

// Users
router.get('/users', listUsers);
router.put('/users/:id/status', updateUserStatus);

// Doctors
router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.put('/doctors/:id/toggle', toggleDoctorActive);

// Appointments
router.get('/appointments', listAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

// Audit
router.get('/audit-logs', getAuditLogs);

module.exports = router;
