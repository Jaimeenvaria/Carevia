const mapUserAndProfileToFHIRPatient = (user, profile) => {
    return {
        resourceType: "Patient",
        id: user._id.toString(),
        identifier: [
            {
                system: "http://patientra.health/fhir/sid/us-ssn",
                value: user._id.toString()
            }
        ],
        active: user.status === 'active',
        name: [
            {
                use: "official",
                text: user.name
            }
        ],
        telecom: [
            {
                system: "email",
                value: user.email
            },
            {
                system: "phone",
                value: user.phone || ""
            }
        ],
        gender: profile ? (profile.gender === 'male' ? 'male' : profile.gender === 'female' ? 'female' : 'other') : 'unknown',
        birthDate: profile && profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : null,
        address: profile && profile.city ? [
            {
                city: profile.city,
                country: "IND"
            }
        ] : []
    };
};

module.exports = { mapUserAndProfileToFHIRPatient };
