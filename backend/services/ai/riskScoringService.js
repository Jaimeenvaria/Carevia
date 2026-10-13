const HealthMetric = require('../../models/HealthMetric');
const ClinicalAlert = require('../../models/ClinicalAlert');

const calculateRiskIndicator = async (patientId) => {
    const alerts = await ClinicalAlert.find({ patientId, status: 'active' });
    const metrics = await HealthMetric.find({ patientId }).sort({ recordedAt: -1 }).limit(10);

    let baseScore = 15; // baseline low indicator
    const factors = [];

    // Alert contributions
    alerts.forEach(alert => {
        if (alert.severity === 'critical') {
            baseScore += 35;
            factors.push(`Critical Alert: ${alert.title}`);
        } else if (alert.severity === 'high') {
            baseScore += 25;
            factors.push(`High Priority Alert: ${alert.title}`);
        } else if (alert.severity === 'medium') {
            baseScore += 15;
            factors.push(`Moderate Alert: ${alert.title}`);
        }
    });

    // Recent metric flags
    const recentBP = metrics.find(m => m.metricType === 'blood_pressure');
    if (recentBP && recentBP.value > 140) {
        baseScore += 10;
        factors.push(`Elevated Blood Pressure Reading (${recentBP.value} mmHg)`);
    }

    const recentGlucose = metrics.find(m => m.metricType === 'glucose');
    if (recentGlucose && recentGlucose.value > 180) {
        baseScore += 10;
        factors.push(`Elevated Glucose Reading (${recentGlucose.value} mg/dL)`);
    }

    const indicatorScore = Math.min(95, Math.max(10, baseScore));
    let category = 'Low';
    if (indicatorScore > 65) category = 'High';
    else if (indicatorScore > 40) category = 'Moderate';

    return {
        name: "AI Monitoring Risk Indicator",
        level: category,
        score: indicatorScore,
        contributingFactors: factors.length > 0 ? factors : ["Vitals within expected stable limits"],
        disclaimer: "The AI Monitoring Risk Indicator is an automated analytical parameter designed for clinical workflow prioritization. It is not a medical diagnosis or prognostic score."
    };
};

module.exports = { calculateRiskIndicator };
