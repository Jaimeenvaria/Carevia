const { processPatientIntake } = require('../services/ai/intakeAgent');
const { recommendDoctors } = require('../services/ai/doctorRecommendationAgent');
const { handleAppointmentAgentRequest } = require('../services/ai/appointmentAgent');
const { generateAppointmentPreparation } = require('../services/ai/appointmentPreparationAgent');
const { generateClinicalSummary } = require('../services/ai/clinicalSummaryAgent');
const { analyzePatientVitals } = require('../services/ai/anomalyDetectionService');
const { calculateRiskIndicator } = require('../services/ai/riskScoringService');
const { generateFollowUpAssistant } = require('../services/ai/followupAgent');
const AIConversation = require('../models/AIConversation');
const { logAuditEvent } = require('../services/auditService');

// Care Assistant
exports.careAssistant = async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const result = await processPatientIntake({
            message,
            conversationId,
            patientId: req.user._id
        });

        // Store conversation
        if (conversationId) {
            await AIConversation.findByIdAndUpdate(conversationId, {
                $push: {
                    messages: [
                        { sender: 'user', content: message },
                        { sender: 'assistant', content: result.reply }
                    ]
                }
            });
        } else {
            const conv = await AIConversation.create({
                userId: req.user._id,
                conversationType: 'care_assistant',
                messages: [
                    { sender: 'user', content: message },
                    { sender: 'assistant', content: result.reply }
                ]
            });
            result.conversationId = conv._id;
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Care Assistant error:', error);
        res.status(500).json({ message: 'AI Care Assistant error', error: error.message });
    }
};

// Doctor Recommendations
exports.recommendDoctorsHandler = async (req, res) => {
    try {
        const { message, specialty, location, preferredDate } = req.body;
        const result = await recommendDoctors({ message, specialty, location, preferredDate });
        res.status(200).json(result);
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ message: 'Doctor recommendation error', error: error.message });
    }
};

// Appointment Agent
exports.appointmentAgent = async (req, res) => {
    try {
        const { message, confirmBooking, selectedSlot, doctorId } = req.body;
        const result = await handleAppointmentAgentRequest({
            message,
            confirmBooking,
            selectedSlot,
            patientId: req.user._id,
            doctorId
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('Appointment Agent error:', error);
        res.status(500).json({ message: 'Appointment agent error', error: error.message });
    }
};

// Appointment Preparation
exports.appointmentPreparation = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const result = await generateAppointmentPreparation({
            appointmentId,
            patientId: req.user._id
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('Appointment Prep error:', error);
        res.status(500).json({ message: 'Appointment preparation error', error: error.message });
    }
};

// Clinical Summary (Doctor)
exports.clinicalSummary = async (req, res) => {
    try {
        const { patientId } = req.body;
        const result = await generateClinicalSummary(patientId);

        await logAuditEvent({
            actorId: req.user._id,
            actorRole: 'doctor',
            action: 'AI_CLINICAL_SUMMARY',
            resourceType: 'PatientProfile',
            resourceId: patientId,
            req
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Clinical Summary error:', error);
        res.status(500).json({ message: 'Clinical summary error', error: error.message });
    }
};

// Anomaly Detection
exports.anomalyDetection = async (req, res) => {
    try {
        const { patientId } = req.params;
        const alerts = await analyzePatientVitals(patientId);
        res.status(200).json({ alerts });
    } catch (error) {
        res.status(500).json({ message: 'Anomaly detection error', error: error.message });
    }
};

// Risk Indicator
exports.riskIndicator = async (req, res) => {
    try {
        const { patientId } = req.params;
        const result = await calculateRiskIndicator(patientId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Risk indicator error', error: error.message });
    }
};

// Follow-up
exports.followUp = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const Appointment = require('../models/Appointment');
        const User = require('../models/User');
        const Doctor = require('../models/Doctor');

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        const patientUser = await User.findById(appointment.patientId);
        const doctor = await Doctor.findById(appointment.doctorId);

        const result = await generateFollowUpAssistant({ appointment, patientUser, doctor });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Follow-up error', error: error.message });
    }
};
