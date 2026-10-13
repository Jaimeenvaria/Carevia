const Doctor = require('../models/Doctor');
const { computeDoctorMatchScore } = require('../services/doctor/doctorRankingService');

// Search doctors from MongoDB (replaces hard-coded array)
exports.searchDoctors = async (req, res) => {
    try {
        const { specialty, city, location, hospital, rating, experience, appointmentType, q } = req.query;
        const query = { isActive: true };

        if (specialty) query.specialty = { $regex: new RegExp(specialty, 'i') };
        if (city || location) query.city = { $regex: new RegExp(city || location, 'i') };
        if (hospital) query.hospital = { $regex: new RegExp(hospital, 'i') };
        if (rating) query.rating = { $gte: parseFloat(rating) };
        if (experience) query.experienceYears = { $gte: parseInt(experience) };
        if (q) {
            query.$or = [
                { name: { $regex: new RegExp(q, 'i') } },
                { specialty: { $regex: new RegExp(q, 'i') } },
                { hospital: { $regex: new RegExp(q, 'i') } },
                { city: { $regex: new RegExp(q, 'i') } }
            ];
        }

        let doctors = await Doctor.find(query).sort({ rating: -1 }).limit(50);

        // Add AI Match Score to each doctor
        const criteria = { specialty, city: city || location };
        const results = doctors.map(doc => {
            const docObj = doc.toObject();
            const ranking = computeDoctorMatchScore(docObj, criteria);
            return {
                ...docObj,
                aiMatchScore: ranking.matchScore,
                aiMatchExplanation: ranking.explanation
            };
        });

        results.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

        res.status(200).json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Failed to search doctors.' });
    }
};

// Get a single doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctor.' });
    }
};

// Get all specialties
exports.getSpecialties = async (req, res) => {
    try {
        const specialties = await Doctor.distinct('specialty', { isActive: true });
        res.status(200).json(specialties);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch specialties.' });
    }
};

// Get all cities
exports.getCities = async (req, res) => {
    try {
        const cities = await Doctor.distinct('city', { isActive: true });
        res.status(200).json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch cities.' });
    }
};
