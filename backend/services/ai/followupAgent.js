const Notification = require('../../models/Notification');
const { sendFollowupEmail } = require('../emailService');

const generateFollowUpAssistant = async ({ appointment, patientUser, doctor }) => {
    const title = `Post-Visit Follow-Up: Consultation with Dr. ${doctor ? doctor.name : 'Specialist'}`;
    const message = `Thank you for completing your visit. Please log your vitals regularly and follow prescribed guidelines. Schedule a follow-up in 30 days if symptoms persist.`;

    // Save in-app notification
    await Notification.create({
        userId: patientUser._id,
        type: 'follow_up',
        title,
        message,
        scheduledFor: new Date()
    });

    // Send email notification
    if (patientUser.email) {
        await sendFollowupEmail({
            email: patientUser.email,
            patientName: patientUser.name,
            doctorName: doctor ? doctor.name : 'your doctor',
            recommendations: message
        });
    }

    return {
        success: true,
        title,
        message,
        scheduledFollowUpDays: 30
    };
};

module.exports = { generateFollowUpAssistant };
