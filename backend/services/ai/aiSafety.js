const EMERGENCY_KEYWORDS = [
    'chest pain', 'severe pressure', 'shortness of breath', 'can\'t breathe',
    'stroke', 'face drooping', 'arm numbness', 'sudden weakness', 'unconscious',
    'severe bleeding', 'suicide', 'self harm', 'poison', 'anaphylaxis', 'overdose'
];

const checkEmergencySafety = (text = '') => {
    const lower = text.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));

    if (isEmergency) {
        return {
            isEmergency: true,
            message: `⚠️ **CRITICAL SAFETY NOTICE**: Your query contains symptoms that may indicate a medical emergency. 

Please **call 108 / 911 or visit the nearest emergency department immediately**. 

Patientra AI is an assistant tool and **cannot evaluate or treat life-threatening conditions**.`
        };
    }

    return { isEmergency: false };
};

const STANDARD_HEALTHCARE_DISCLAIMER = `*Disclaimer: Patientra AI provides health education and navigation assistance only. It does not provide medical diagnoses, treatment plans, or emergency triage. Always verify clinical advice with a licensed healthcare professional.*`;

module.exports = {
    checkEmergencySafety,
    STANDARD_HEALTHCARE_DISCLAIMER
};
