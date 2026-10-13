const Doctor = require('../../models/Doctor');
const { computeDoctorMatchScore } = require('../doctor/doctorRankingService');

const parseCriteriaFromMessage = (message = '', specialty = '', location = '') => {
    const text = message.toLowerCase();
    let detectedSpecialty = specialty;
    let detectedCity = location;

    if (!detectedSpecialty) {
        if (text.includes('cardio') || text.includes('heart')) detectedSpecialty = 'Cardiology';
        else if (text.includes('derma') || text.includes('skin')) detectedSpecialty = 'Dermatology';
        else if (text.includes('neuro') || text.includes('brain') || text.includes('headache')) detectedSpecialty = 'Neurology';
        else if (text.includes('child') || text.includes('pediatric')) detectedSpecialty = 'Pediatrics';
        else if (text.includes('bone') || text.includes('joint') || text.includes('ortho')) detectedSpecialty = 'Orthopedics';
        else if (text.includes('mental') || text.includes('psychiatry')) detectedSpecialty = 'Psychiatry';
        else if (text.includes('diabetes') || text.includes('thyroid')) detectedSpecialty = 'Endocrinology';
        else detectedSpecialty = 'General Medicine';
    }

    if (!detectedCity) {
        if (text.includes('hyderabad')) detectedCity = 'Hyderabad';
        else if (text.includes('bangalore') || text.includes('bengaluru')) detectedCity = 'Bangalore';
        else if (text.includes('chennai')) detectedCity = 'Chennai';
        else if (text.includes('mumbai')) detectedCity = 'Mumbai';
        else if (text.includes('delhi')) detectedCity = 'Delhi';
        else detectedCity = 'Hyderabad';
    }

    return { specialty: detectedSpecialty, city: detectedCity };
};

const recommendDoctors = async ({ message, specialty, location, preferredDate }) => {
    // 1. Natural Language -> Structured Criteria
    const criteria = parseCriteriaFromMessage(message, specialty, location);

    // 2. Query MongoDB Doctor collection ONLY (never invent fake doctors)
    const query = { isActive: true };
    if (criteria.specialty) {
        query.specialty = { $regex: new RegExp(criteria.specialty, 'i') };
    }
    if (criteria.city) {
        query.city = { $regex: new RegExp(criteria.city, 'i') };
    }

    let doctors = await Doctor.find(query).limit(10);

    // Fallback if strict filter yields few results
    if (doctors.length < 3) {
        doctors = await Doctor.find({ isActive: true }).limit(10);
    }

    // 3. Score & Rank doctors using doctorRankingService
    const rankedDoctors = doctors.map(doc => {
        const docObj = doc.toObject();
        const ranking = computeDoctorMatchScore(docObj, criteria);
        return {
            ...docObj,
            aiMatchScore: ranking.matchScore,
            aiMatchExplanation: ranking.explanation
        };
    }).sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    return {
        criteriaExtracted: criteria,
        doctors: rankedDoctors,
        disclaimer: "AI Match Score is an algorithmic recommendation indicator based on location, availability, experience, and patient ratings. It does not constitute a clinical diagnosis or guarantee medical outcomes."
    };
};

module.exports = { recommendDoctors, parseCriteriaFromMessage };
