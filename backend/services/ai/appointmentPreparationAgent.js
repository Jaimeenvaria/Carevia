const Appointment = require('../../models/Appointment');
const PatientProfile = require('../../models/PatientProfile');
const { STANDARD_HEALTHCARE_DISCLAIMER } = require('./aiSafety');

const generateAppointmentPreparation = async ({ appointmentId, patientId }) => {
    let appointment = null;
    if (appointmentId) {
        appointment = await Appointment.findById(appointmentId).populate('doctorId');
    }
    const profile = await PatientProfile.findOne({ userId: patientId });

    const doctorName = appointment && appointment.doctorId ? appointment.doctorId.name : 'your clinician';
    const specialty = appointment && appointment.doctorId ? appointment.doctorId.specialty : 'Specialist';
    const reason = appointment ? appointment.reasonForVisit : 'General Health Consultation';

    const medicationsList = (profile && profile.currentMedications && profile.currentMedications.length > 0)
        ? profile.currentMedications.map(m => `• ${m.name} (${m.dosage} - ${m.frequency})`).join('\n')
        : '• Bring a complete list of current prescription and over-the-counter medications.';

    const allergiesList = (profile && profile.allergies && profile.allergies.length > 0)
        ? profile.allergies.join(', ')
        : 'None registered';

    return {
        appointmentId,
        doctorName,
        specialty,
        reasonForVisit: reason,
        preparationChecklist: {
            documentsToBring: [
                "Government ID & Insurance Card",
                "Recent lab reports or imaging scans (last 6 months)",
                "Previous discharge summaries or specialist notes"
            ],
            medicationsReminder: medicationsList,
            allergiesNote: allergiesList,
            symptomTimeline: `Log when symptoms first started, trigger factors, and severity (1–10 scale).`,
            suggestedQuestions: [
                `What could be causing my symptoms regarding "${reason}"?`,
                `Are there specific lifestyle or dietary modifications recommended for my condition?`,
                `What side effects should I monitor if new medications are prescribed?`,
                `When should I schedule a follow-up visit?`
            ]
        },
        disclaimer: STANDARD_HEALTHCARE_DISCLAIMER
    };
};

module.exports = { generateAppointmentPreparation };
