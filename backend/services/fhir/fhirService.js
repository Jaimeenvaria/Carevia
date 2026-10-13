const User = require('../../models/User');
const PatientProfile = require('../../models/PatientProfile');
const HealthMetric = require('../../models/HealthMetric');
const Appointment = require('../../models/Appointment');
const { mapUserAndProfileToFHIRPatient } = require('./patientMapper');
const { mapHealthMetricToFHIRObservation } = require('./observationMapper');
const { mapAppointmentToFHIRAppointment } = require('./appointmentMapper');
const { mapCompletedAppointmentToFHIREncounter } = require('./encounterMapper');

const getFHIRPatient = async (patientId) => {
    const user = await User.findById(patientId);
    if (!user) return null;
    const profile = await PatientProfile.findOne({ userId: patientId });
    return mapUserAndProfileToFHIRPatient(user, profile);
};

const getFHIRObservations = async (patientId) => {
    const metrics = await HealthMetric.find({ patientId }).sort({ recordedAt: -1 });
    return {
        resourceType: "Bundle",
        type: "searchset",
        total: metrics.length,
        entry: metrics.map(m => ({ resource: mapHealthMetricToFHIRObservation(m) }))
    };
};

const getFHIRAppointments = async (patientId) => {
    const appointments = await Appointment.find({ patientId }).sort({ appointmentDate: -1 });
    return {
        resourceType: "Bundle",
        type: "searchset",
        total: appointments.length,
        entry: appointments.map(a => ({ resource: mapAppointmentToFHIRAppointment(a) }))
    };
};

module.exports = {
    getFHIRPatient,
    getFHIRObservations,
    getFHIRAppointments
};
