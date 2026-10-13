const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true }, // e.g., "10:30 AM"
    duration: { type: Number, default: 30 },
    reasonForVisit: { type: String, required: true },
    symptoms: [{ type: String }],
    notes: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
        default: 'pending'
    },
    appointmentType: {
        type: String,
        enum: ['in_person', 'telehealth'],
        default: 'in_person'
    },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
