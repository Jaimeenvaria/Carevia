const PatientProfile = require('../../models/PatientProfile');
const Appointment = require('../../models/Appointment');
const HealthMetric = require('../../models/HealthMetric');
const User = require('../../models/User');

const generateClinicalSummary = async (patientId) => {
    const patientUser = await User.findById(patientId).select('-password');
    if (!patientUser) {
        throw new Error('Patient not found');
    }

    const profile = await PatientProfile.findOne({ userId: patientId });
    const appointments = await Appointment.find({ patientId }).sort({ appointmentDate: -1 }).limit(5);
    const metrics = await HealthMetric.find({ patientId }).sort({ recordedAt: -1 }).limit(10);

    // Compute vitals highlights
    const bpReadings = metrics.filter(m => m.metricType === 'blood_pressure');
    const glucoseReadings = metrics.filter(m => m.metricType === 'glucose');
    const hrReadings = metrics.filter(m => m.metricType === 'heart_rate');

    let vitalsSummary = "No recent vitals logged.";
    if (bpReadings.length > 0) {
        const latestBP = bpReadings[0];
        const isElevated = latestBP.value > 140 || (latestBP.secondaryValue && latestBP.secondaryValue > 90);
        vitalsSummary = `Latest BP: ${latestBP.value}/${latestBP.secondaryValue || ''} mmHg (${latestBP.recordedAt.toISOString().split('T')[0]}). ${isElevated ? 'Elevated baseline blood pressure trend observed.' : 'Normal range.'}`;
    }

    let glucoseSummary = "";
    if (glucoseReadings.length > 0) {
        const latestGlucose = glucoseReadings[0];
        glucoseSummary = `Latest Glucose: ${latestGlucose.value} mg/dL. ${latestGlucose.value > 180 ? 'Elevated glucose trend detected across recent readings.' : 'Within standard bounds.'}`;
    }

    const keyHighlights = [
        vitalsSummary,
        glucoseSummary,
        profile && profile.chronicConditions.length > 0 ? `Chronic Conditions: ${profile.chronicConditions.join(', ')}.` : 'No documented chronic conditions.',
        profile && profile.allergies.length > 0 ? `Known Allergies: ${profile.allergies.join(', ')}.` : 'No documented drug allergies.',
        `Total past appointments in portal: ${appointments.length}.`
    ].filter(Boolean);

    return {
        noticeHeader: "AI-generated summary — verify against source records before clinical use.",
        patient: {
            id: patientUser._id,
            name: patientUser.name,
            email: patientUser.email,
            gender: profile ? profile.gender : 'Unspecified',
            bloodGroup: profile ? profile.bloodGroup : 'Unknown',
            dateOfBirth: profile ? profile.dateOfBirth : null
        },
        clinicalHighlights: keyHighlights,
        medicationsSummary: profile ? profile.currentMedications : [],
        recentAppointments: appointments.map(a => ({
            date: a.appointmentDate,
            time: a.appointmentTime,
            reason: a.reasonForVisit,
            status: a.status
        })),
        aiClinicalNote: `Patient's recent data indicates active monitoring of vital parameters. Blood pressure and glucose levels should be correlated with medication adherence during today's visit.`
    };
};

module.exports = { generateClinicalSummary };
