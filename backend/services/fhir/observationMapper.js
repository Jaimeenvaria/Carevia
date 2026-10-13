const mapHealthMetricToFHIRObservation = (metric) => {
    const codeMap = {
        blood_pressure: { code: "85354-9", display: "Blood Pressure" },
        glucose: { code: "2339-0", display: "Glucose [Mass/volume] in Blood" },
        heart_rate: { code: "8867-4", display: "Heart rate" },
        oxygen_saturation: { code: "2708-6", display: "Oxygen saturation in Arterial blood by Pulse oximetry" },
        weight: { code: "29463-7", display: "Body weight" },
        temperature: { code: "8310-5", display: "Body temperature" }
    };

    const details = codeMap[metric.metricType] || { code: "8302-2", display: metric.metricType };

    return {
        resourceType: "Observation",
        id: metric._id.toString(),
        status: "final",
        category: [
            {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/observation-category",
                        code: "vital-signs",
                        display: "Vital Signs"
                    }
                ]
            }
        ],
        code: {
            coding: [
                {
                    system: "http://loinc.org",
                    code: details.code,
                    display: details.display
                }
            ],
            text: details.display
        },
        subject: {
            reference: `Patient/${metric.patientId}`
        },
        effectiveDateTime: metric.recordedAt,
        valueQuantity: {
            value: metric.value,
            unit: metric.unit,
            system: "http://unitsofmeasure.org"
        },
        component: metric.secondaryValue ? [
            {
                code: {
                    coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic Blood Pressure" }]
                },
                valueQuantity: { value: metric.secondaryValue, unit: metric.unit }
            }
        ] : []
    };
};

module.exports = { mapHealthMetricToFHIRObservation };
