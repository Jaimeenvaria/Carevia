const mongoose = require('mongoose');

const clinicalAlertSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    metricType: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    detectedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'reviewed', 'dismissed'], default: 'active' },
    requiresClinicianReview: { type: Boolean, default: true },
    source: { type: String, default: 'AI Anomaly Detection Engine' }
}, { timestamps: true });

module.exports = mongoose.model('ClinicalAlert', clinicalAlertSchema);
