const mapAppointmentToFHIRAppointment = (app) => {
    return {
        resourceType: "Appointment",
        id: app._id.toString(),
        status: app.status === 'confirmed' ? 'booked' : app.status === 'completed' ? 'fulfilled' : app.status === 'cancelled' ? 'cancelled' : 'proposed',
        serviceType: [
            {
                text: app.reasonForVisit
            }
        ],
        appointmentType: {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/v2-0276",
                    code: app.appointmentType === 'telehealth' ? 'VR' : 'ROUTINE',
                    display: app.appointmentType === 'telehealth' ? 'Virtual' : 'Routine Visit'
                }
            ]
        },
        start: app.appointmentDate,
        minutesDuration: app.duration || 30,
        participant: [
            {
                actor: { reference: `Patient/${app.patientId}` },
                status: "accepted"
            },
            {
                actor: { reference: `Practitioner/${app.doctorId}` },
                status: "accepted"
            }
        ]
    };
};

module.exports = { mapAppointmentToFHIRAppointment };
