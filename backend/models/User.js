const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['patient', 'doctor', 'admin'], 
        default: 'patient' 
    },
    phone: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    profileImage: { type: String, default: '' },
    lastLoginAt: { type: Date },
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
}, { timestamps: true });

// Ensure security: prevent returning hashes by default in JSON
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.otpHash;
    delete obj.otpExpiresAt;
    delete obj.otpAttempts;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
