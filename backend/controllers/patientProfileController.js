const PatientProfile = require('../models/PatientProfile');

exports.getProfile = async (req, res) => {
    try {
        let profile = await PatientProfile.findOne({ userId: req.user._id });
        if (!profile) {
            profile = await PatientProfile.create({ userId: req.user._id });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const profile = await PatientProfile.findOneAndUpdate(
            { userId: req.user._id },
            { ...req.body },
            { new: true, upsert: true }
        );
        res.status(200).json({ message: 'Profile updated.', profile });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile.' });
    }
};
