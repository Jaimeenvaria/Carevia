const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    metricType: { 
        type: String, 
        required: true,
        enum: ['blood_pressure', 'glucose', 'heart_rate', 'oxygen_saturation', 'weight', 'temperature']
    },
    value: { type: Number, required: true },
    secondaryValue: { type: Number }, // e.g. Diastolic BP
    unit: { type: String, required: true },
    recordedAt: { type: Date, default: Date.now, index: true },
    source: { 
        type: String, 
        enum: ['manual', 'wearable', 'imported'], 
        default: 'manual' 
    },
    notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
