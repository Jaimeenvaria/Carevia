const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { sendAppointmentConfirmation, sendCancellationEmail } = require('../services/emailService');
const { logAuditEvent } = require('../services/auditService');

// Book an appointment
exports.bookAppointment = async (req, res) => {
    const { doctorId, appointmentDate, appointmentTime, reasonForVisit, symptoms, notes, appointmentType } = req.body;

    try {
        if (!doctorId || !appointmentDate || !appointmentTime || !reasonForVisit) {
            return res.status(400).json({ message: 'Doctor, date, time, and reason are required.' });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const appointment = new Appointment({
            patientId: req.user._id,
            doctorId,
            appointmentDate: new Date(appointmentDate),
            appointmentTime,
            duration: doctor.appointmentDuration || 30,
            reasonForVisit,
            symptoms: symptoms || [],
            notes: notes || '',
            appointmentType: appointmentType || 'in_person',
            status: 'confirmed'
        });

        await appointment.save();

        // Send confirmation email
        await sendAppointmentConfirmation({
            email: req.user.email,
            patientName: req.user.name,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            date: appointmentDate,
            time: appointmentTime,
            appointmentType: appointmentType || 'in_person'
        });

        await logAuditEvent({
            actorId: req.user._id,
            actorRole: req.user.role,
            action: 'APPOINTMENT_CREATE',
            resourceType: 'Appointment',
            resourceId: appointment._id,
            metadata: { doctorId, appointmentDate, appointmentTime },
            req
        });

        const populated = await Appointment.findById(appointment._id)
            .populate('doctorId', 'name specialty hospital city')
            .populate('patientId', 'name email');

        res.status(201).json({ message: 'Appointment booked successfully!', appointment: populated });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Failed to book appointment', error: error.message });
    }
};

// Get appointments for the logged-in patient
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user._id })
            .populate('doctorId', 'name specialty hospital city profileImage')
            .sort({ appointmentDate: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments.' });
    }
};

// Get all appointments (admin)
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctorId', 'name specialty hospital city')
            .populate('patientId', 'name email')
            .sort({ appointmentDate: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments.' });
    }
};

// Get appointments for a doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const appointments = await Appointment.find({ doctorId: doctor._id })
            .populate('patientId', 'name email phone')
            .sort({ appointmentDate: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctor appointments.' });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('doctorId', 'name specialty').populate('patientId', 'name email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Send cancellation email if status changed to cancelled
        if (status === 'cancelled' && appointment.patientId && appointment.patientId.email) {
            await sendCancellationEmail({
                email: appointment.patientId.email,
                patientName: appointment.patientId.name,
                doctorName: appointment.doctorId ? appointment.doctorId.name : 'Doctor',
                date: appointment.appointmentDate
            });
        }

        await logAuditEvent({
            actorId: req.user._id,
            actorRole: req.user.role,
            action: `APPOINTMENT_${status.toUpperCase()}`,
            resourceType: 'Appointment',
            resourceId: id,
            req
        });

        res.status(200).json({ message: `Appointment ${status} successfully.`, appointment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update appointment.' });
    }
};

// Cancel/Delete an appointment
exports.cancelAppointment = async (req, res) => {
    const { id } = req.params;

    try {
        const appointment = await Appointment.findById(id)
            .populate('doctorId', 'name')
            .populate('patientId', 'name email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        if (appointment.patientId && appointment.patientId.email) {
            await sendCancellationEmail({
                email: appointment.patientId.email,
                patientName: appointment.patientId.name,
                doctorName: appointment.doctorId ? appointment.doctorId.name : 'Doctor',
                date: appointment.appointmentDate
            });
        }

        await logAuditEvent({
            actorId: req.user._id,
            actorRole: req.user.role,
            action: 'APPOINTMENT_CANCEL',
            resourceType: 'Appointment',
            resourceId: id,
            req
        });

        res.status(200).json({ message: 'Appointment cancelled successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel appointment.' });
    }
};
