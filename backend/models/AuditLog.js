const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String, default: 'anonymous' },
    action: { type: String, required: true }, // e.g. "USER_LOGIN", "APPOINTMENT_CREATE", "AI_SUMMARY_GENERATE"
    resourceType: { type: String, required: true }, // e.g. "User", "Appointment", "HealthMetric"
    resourceId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String, default: '127.0.0.1' },
    timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: false });

module.exports = mongoose.model('AuditLog', auditLogSchema);
