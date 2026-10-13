const mapCompletedAppointmentToFHIREncounter = (app) => {
    return {
        resourceType: "Encounter",
        id: `enc-${app._id.toString()}`,
        status: "finished",
        class: {
            system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            code: app.appointmentType === 'telehealth' ? 'VR' : 'AMB',
            display: app.appointmentType === 'telehealth' ? 'virtual' : 'ambulatory'
        },
        subject: {
            reference: `Patient/${app.patientId}`
        },
        participant: [
            {
                individual: {
                    reference: `Practitioner/${app.doctorId}`
                }
            }
        ],
        period: {
            start: app.appointmentDate
        },
        reasonCode: [
            {
                text: app.reasonForVisit
            }
        ]
    };
};

module.exports = { mapCompletedAppointmentToFHIREncounter };
