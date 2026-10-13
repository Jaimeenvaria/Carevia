const HealthMetric = require('../../models/HealthMetric');
const ClinicalAlert = require('../../models/ClinicalAlert');

const analyzePatientVitals = async (patientId) => {
    const metrics = await HealthMetric.find({ patientId }).sort({ recordedAt: 1 });
    if (metrics.length === 0) return [];

    const alertsCreated = [];

    // 1. Analyze Blood Pressure Trend
    const bpMetrics = metrics.filter(m => m.metricType === 'blood_pressure');
    if (bpMetrics.length >= 3) {
        const last3 = bpMetrics.slice(-3);
        const isIncreasing = last3[0].value < last3[1].value && last3[1].value < last3[2].value;
        const latestVal = last3[2].value;

        if (isIncreasing && latestVal >= 140) {
            const title = "Persistent Upward Blood Pressure Trend";
            const description = `A persistent upward trend in blood pressure measurements was detected (latest: ${last3[2].value}/${last3[2].secondaryValue || ''} mmHg).`;
            
            // Check if active alert already exists to prevent duplicate spam
            const existing = await ClinicalAlert.findOne({ patientId, metricType: 'blood_pressure', status: 'active' });
            if (!existing) {
                const alert = await ClinicalAlert.create({
                    patientId,
                    metricType: 'blood_pressure',
                    severity: latestVal > 160 ? 'high' : 'medium',
                    title,
                    description,
                    requiresClinicianReview: true,
                    source: 'AI Anomaly Detection Engine'
                });
                alertsCreated.push(alert);
            }
        }
    }

    // 2. Analyze Glucose Abnormalities
    const glucoseMetrics = metrics.filter(m => m.metricType === 'glucose');
    if (glucoseMetrics.length >= 2) {
        const latest = glucoseMetrics[glucoseMetrics.length - 1];
        if (latest.value > 200) {
            const existing = await ClinicalAlert.findOne({ patientId, metricType: 'glucose', status: 'active' });
            if (!existing) {
                const alert = await ClinicalAlert.create({
                    patientId,
                    metricType: 'glucose',
                    severity: latest.value > 250 ? 'critical' : 'high',
                    title: 'Elevated Fasting/Random Glucose Alert',
                    description: `Hyperglycemic reading detected (${latest.value} mg/dL). Clinician review recommended.`,
                    requiresClinicianReview: true,
                    source: 'AI Anomaly Detection Engine'
                });
                alertsCreated.push(alert);
            }
        }
    }

    return alertsCreated;
};

module.exports = { analyzePatientVitals };
