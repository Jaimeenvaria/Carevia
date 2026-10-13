const dotenv = require('dotenv');
dotenv.config();

const isDemoMode = () => {
    return process.env.AI_DEMO_MODE !== 'false' || !process.env.AI_API_KEY;
};

const generateAIResponse = async ({ prompt, userMessage, context = {}, systemPrompt = '' }) => {
    if (!isDemoMode()) {
        try {
            // Placeholder for optional external LLM SDK integration (e.g. OpenAI/Gemini/Anthropic)
            // If AI_API_KEY is present and AI_DEMO_MODE=false, could invoke HTTP API.
        } catch (err) {
            console.warn("AI API call failed, falling back to deterministic AI response:", err.message);
        }
    }

    // High quality deterministic fallback matching requirements
    return getDeterministicResponse({ userMessage, context, systemPrompt });
};

const getDeterministicResponse = ({ userMessage = '', context = {} }) => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('headache') || msg.includes('migraine')) {
        return {
            text: `I can help you identify the type of care that may be appropriate, but I cannot diagnose the cause of your symptoms. 

Persistent headaches lasting several days should be evaluated by a medical professional. Depending on your symptoms (such as vision changes or neck stiffness), a **Primary Care Physician** or a **Neurologist** may be appropriate.

Would you like me to help you find a specialist or prepare questions for your visit?`,
            recommendedSpecialty: 'Neurology',
            actionButtons: ['Find a Doctor', 'Book Appointment', 'Ask Clarifying Questions']
        };
    }

    if (msg.includes('chest') || msg.includes('heart') || msg.includes('palpitations') || msg.includes('blood pressure')) {
        return {
            text: `Cardiovascular health symptoms warrant careful evaluation. If you are experiencing mild palpitations, elevated blood pressure readings, or general cardiovascular questions, consulting a **Cardiologist** or **General Physician** is recommended.

*Note: If you experience severe chest pressure, radiating arm pain, or shortness of breath, please seek emergency medical services immediately.*`,
            recommendedSpecialty: 'Cardiology',
            actionButtons: ['Find a Doctor', 'Log Vital Metric', 'View Cardiology Doctors']
        };
    }

    if (msg.includes('skin') || msg.includes('rash') || msg.includes('acne') || msg.includes('mole')) {
        return {
            text: `Dermatological concerns such as skin rashes, changing moles, or persistent irritation are best evaluated by a certified **Dermatologist**. 

I can assist you in filtering verified dermatologists in your city and booking an in-person or telehealth consultation.`,
            recommendedSpecialty: 'Dermatology',
            actionButtons: ['Find a Doctor', 'Book Telehealth Visit']
        };
    }

    if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule')) {
        return {
            text: `I can assist you with booking an appointment! Please tell me your preferred specialty (e.g. Cardiology, Dermatology, Pediatrics), your city, or the doctor's name you wish to visit.`,
            recommendedSpecialty: null,
            actionButtons: ['Browse Doctors', 'View My Appointments']
        };
    }

    return {
        text: `Thank you for reaching out to Patientra AI Care Assistant. I am here to help guide your healthcare journey, assist with finding appropriate specialists, and help prepare you for medical visits.

Could you share a bit more detail about what symptoms or healthcare assistance you need today?`,
        recommendedSpecialty: 'General Medicine',
        actionButtons: ['Find a Doctor', 'Log Health Vitals', 'Ask Care Assistant']
    };
};

module.exports = {
    generateAIResponse,
    isDemoMode
};
