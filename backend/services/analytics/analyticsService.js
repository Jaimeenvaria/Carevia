const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const PatientProfile = require('../../models/PatientProfile');

const getAdminAnalytics = async () => {
    // 1. Total KPI Counts
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

    // 2. Appointments by Specialty
    const bySpecialty = await Appointment.aggregate([
        {
            $lookup: {
                from: 'doctors',
                localField: 'doctorId',
                foreignField: '_id',
                as: 'doctor'
            }
        },
        { $unwind: '$doctor' },
        {
            $group: {
                _id: '$doctor.specialty',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // 3. Appointments by City
    const byCity = await Appointment.aggregate([
        {
            $lookup: {
                from: 'doctors',
                localField: 'doctorId',
                foreignField: '_id',
                as: 'doctor'
            }
        },
        { $unwind: '$doctor' },
        {
            $group: {
                _id: '$doctor.city',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // 4. Appointments by Status
    const byStatus = await Appointment.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // 5. Generate Dynamic AI Insights based on actual aggregate data
    const aiInsights = [];
    if (bySpecialty.length > 0) {
        const topSpec = bySpecialty[0];
        aiInsights.push(`Highest demand observed in ${topSpec._id} with ${topSpec.count} total bookings.`);
    }
    if (byCity.length > 0) {
        const topCity = byCity[0];
        aiInsights.push(`${topCity._id} represents the primary geographic cluster (${topCity.count} appointments).`);
    }
    const cancelRate = totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1) : 0;
    aiInsights.push(`Current overall cancellation rate is ${cancelRate}%.`);

    if (pendingAppointments > 5) {
        aiInsights.push(`Operational Alert: ${pendingAppointments} appointments are currently pending confirmation.`);
    }

    return {
        kpis: {
            totalUsers,
            totalDoctors,
            totalPatients,
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            pendingAppointments,
            cancellationRate: `${cancelRate}%`
        },
        charts: {
            bySpecialty: bySpecialty.map(item => ({ name: item._id, count: item.count })),
            byCity: byCity.map(item => ({ name: item._id, count: item.count })),
            byStatus: byStatus.map(item => ({ name: item._id, count: item.count }))
        },
        aiOperationalInsights: aiInsights
    };
};

module.exports = { getAdminAnalytics };
