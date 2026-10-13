const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const { sendAppointmentConfirmation } = require('../emailService');
const { parseCriteriaFromMessage } = require('./doctorRecommendationAgent');

// Controlled Backend Function: Search Doctors
const searchDoctorsInternal = async (criteria) => {
    const query = { isActive: true };
    if (criteria.specialty) {
        query.specialty = { $regex: new RegExp(criteria.specialty, 'i') };
    }
    if (criteria.city) {
        query.city = { $regex: new RegExp(criteria.city, 'i') };
    }
    return await Doctor.find(query).limit(5);
};

// Controlled Backend Function: Get Availability
const getDoctorAvailabilityInternal = async (doctorId) => {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return null;

    // Return realistic upcoming slots
    const sampleTimes = ["09:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
        doctorId: doctor._id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        availableSlots: sampleTimes.map(time => ({
            date: tomorrow.toISOString().split('T')[0],
            time: time,
            type: 'in_person'
        }))
    };
};

// Controlled Backend Function: Create Appointment (Only called on explicit confirmation!)
const createAppointmentInternal = async ({ patientId, doctorId, date, time, reasonForVisit, appointmentType = 'in_person' }) => {
    const appointment = new Appointment({
        patientId,
        doctorId,
        appointmentDate: new Date(date),
        appointmentTime: time,
        reasonForVisit: reasonForVisit || 'AI Agent Booking',
        status: 'confirmed',
        appointmentType
    });
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
        .populate('doctorId', 'name specialty hospital location')
        .populate('patientId', 'name email');

    if (populated.patientId && populated.patientId.email) {
        await sendAppointmentConfirmation({
            email: populated.patientId.email,
            patientName: populated.patientId.name,
            doctorName: populated.doctorId.name,
            specialty: populated.doctorId.specialty,
            date: date,
            time: time,
            appointmentType
        });
    }

    return populated;
};

const handleAppointmentAgentRequest = async ({ message, confirmBooking = false, selectedSlot = null, patientId, doctorId = null }) => {
    // 1. If explicit confirmation passed with slot details
    if (confirmBooking && doctorId && selectedSlot) {
        const booked = await createAppointmentInternal({
            patientId,
            doctorId,
            date: selectedSlot.date,
            time: selectedSlot.time,
            reasonForVisit: selectedSlot.reason || 'Consultation requested via AI Agent',
            appointmentType: selectedSlot.type || 'in_person'
        });

        return {
            stage: 'CONFIRMED',
            reply: `✅ **Appointment Successfully Booked!**\n\nYour appointment with **Dr. ${booked.doctorId.name}** (${booked.doctorId.specialty}) is scheduled for **${selectedSlot.date} at ${selectedSlot.time}**. A confirmation email has been sent.`,
            appointment: booked
        };
    }

    // 2. Parse request criteria
    const criteria = parseCriteriaFromMessage(message);
    const doctors = await searchDoctorsInternal(criteria);

    if (doctors.length === 0) {
        return {
            stage: 'SEARCH',
            reply: `I searched for doctors matching "${criteria.specialty}" in "${criteria.city}", but none were available. Would you like to expand your search to all specialties?`,
            doctors: []
        };
    }

    const primaryDoc = doctors[0];
    const availability = await getDoctorAvailabilityInternal(primaryDoc._id);

    return {
        stage: 'SLOT_SELECTION',
        reply: `I found **Dr. ${primaryDoc.name}** (${primaryDoc.specialty} at ${primaryDoc.hospital}, ${primaryDoc.city}).\n\nHere are available upcoming slots:`,
        doctor: primaryDoc,
        availableSlots: availability.availableSlots,
        requiresExplicitConfirmation: true,
        confirmationPrompt: "Please select a slot and click 'Confirm Booking' to finalize."
    };
};

module.exports = {
    handleAppointmentAgentRequest,
    searchDoctorsInternal,
    getDoctorAvailabilityInternal,
    createAppointmentInternal
};
