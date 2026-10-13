const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const AuditLog = require('../models/AuditLog');
const { logAuditEvent } = require('../services/auditService');

// === User Management ===
exports.listUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to list users.' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        await logAuditEvent({
            actorId: req.user._id, actorRole: 'admin',
            action: `USER_${status.toUpperCase()}`,
            resourceType: 'User', resourceId: req.params.id, req
        });

        res.status(200).json({ message: `User ${status} successfully.`, user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user.' });
    }
};

// === Doctor Management ===
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Failed to list doctors.' });
    }
};

exports.addDoctor = async (req, res) => {
    try {
        const { name, email, specialty, hospital, location, city, area, experienceYears, education, languages, consultationFee, bio, availability } = req.body;

        // Create a user account for the doctor
        const bcrypt = require('bcryptjs');
        const password = await bcrypt.hash('Doctor@123', 12);
        const user = new User({
            name,
            email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@patientra.health`,
            password,
            role: 'doctor',
            isVerified: true,
            status: 'active'
        });
        await user.save();

        const doctor = new Doctor({
            userId: user._id,
            name,
            specialty,
            hospital,
            location: location || city,
            city: city || location,
            area: area || '',
            experienceYears: experienceYears || 5,
            education: education || 'MBBS',
            languages: languages || ['English', 'Hindi'],
            consultationFee: consultationFee || 500,
            bio: bio || `${name} is a specialist in ${specialty}.`,
            availability: availability || [
                { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                { day: 'Friday', startTime: '09:00', endTime: '17:00', slotDuration: 30 }
            ]
        });
        await doctor.save();

        await logAuditEvent({
            actorId: req.user._id, actorRole: 'admin',
            action: 'DOCTOR_CREATE',
            resourceType: 'Doctor', resourceId: doctor._id,
            metadata: { name, specialty, city }, req
        });

        res.status(201).json({ message: 'Doctor added successfully.', doctor });
    } catch (error) {
        console.error('Add doctor error:', error);
        res.status(500).json({ message: 'Failed to add doctor.', error: error.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        await logAuditEvent({
            actorId: req.user._id, actorRole: 'admin',
            action: 'DOCTOR_UPDATE',
            resourceType: 'Doctor', resourceId: req.params.id, req
        });

        res.status(200).json({ message: 'Doctor updated successfully.', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update doctor.' });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        await logAuditEvent({
            actorId: req.user._id, actorRole: 'admin',
            action: 'DOCTOR_DELETE',
            resourceType: 'Doctor', resourceId: req.params.id, req
        });

        res.status(200).json({ message: 'Doctor deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete doctor.' });
    }
};

exports.toggleDoctorActive = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        doctor.isActive = !doctor.isActive;
        await doctor.save();

        res.status(200).json({ message: `Doctor ${doctor.isActive ? 'activated' : 'deactivated'}.`, doctor });
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle doctor status.' });
    }
};

// === Appointment Management ===
exports.listAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctorId', 'name specialty hospital city')
            .populate('patientId', 'name email')
            .sort({ appointmentDate: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to list appointments.' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.status(200).json({ message: `Appointment ${status}.`, appointment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update appointment.' });
    }
};

// === Audit Logs ===
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(200);
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch audit logs.' });
    }
};
