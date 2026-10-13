const { generateAIResponse } = require('./aiProvider');
const { checkEmergencySafety, STANDARD_HEALTHCARE_DISCLAIMER } = require('./aiSafety');
const { CARE_ASSISTANT_PROMPT } = require('./aiPrompts');

const processPatientIntake = async ({ message, conversationId, patientId }) => {
    // 1. Safety Triage Check
    const safetyCheck = checkEmergencySafety(message);
    if (safetyCheck.isEmergency) {
        return {
            reply: safetyCheck.message,
            isEmergency: true,
            recommendedSpecialty: null,
            suggestedActions: ['Call Emergency 108/911', 'Find Nearest Hospital']
        };
    }

    // 2. Generate Assistant Guidance
    const aiRes = await generateAIResponse({
        prompt: CARE_ASSISTANT_PROMPT,
        userMessage: message,
        systemPrompt: CARE_ASSISTANT_PROMPT
    });

    const fullReply = `${aiRes.text}\n\n${STANDARD_HEALTHCARE_DISCLAIMER}`;

    return {
        reply: fullReply,
        isEmergency: false,
        recommendedSpecialty: aiRes.recommendedSpecialty,
        suggestedActions: aiRes.actionButtons || ['Find a Doctor', 'Book Appointment']
    };
};

module.exports = { processPatientIntake };
