const { getFHIRPatient, getFHIRObservations, getFHIRAppointments } = require('../services/fhir/fhirService');

exports.getPatient = async (req, res) => {
    try {
        const patient = await getFHIRPatient(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: 'FHIR patient error.' });
    }
};

exports.getObservations = async (req, res) => {
    try {
        const bundle = await getFHIRObservations(req.params.id);
        res.status(200).json(bundle);
    } catch (error) {
        res.status(500).json({ message: 'FHIR observations error.' });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const bundle = await getFHIRAppointments(req.params.id);
        res.status(200).json(bundle);
    } catch (error) {
        res.status(500).json({ message: 'FHIR appointments error.' });
    }
};
