const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], default: 'Unknown' },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedications: [{
        name: String,
        dosage: String,
        frequency: String
    }],
    emergencyContact: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        relation: { type: String, default: '' }
    },
    preferredLanguage: { type: String, default: 'English' },
    city: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
