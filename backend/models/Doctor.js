const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
    day: { 
        type: String, 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true 
    },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "17:00"
    slotDuration: { type: Number, default: 30 }  // in minutes
}, { _id: false });

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, index: true },
    subSpecialties: [{ type: String }],
    hospital: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true, index: true },
    area: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    education: { type: String, default: '' },
    languages: [{ type: String }],
    consultationFee: { type: Number, default: 500 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 12 },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    availability: [availabilitySlotSchema],
    appointmentDuration: { type: Number, default: 30 },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
