const HealthMetric = require('../models/HealthMetric');

// Add a health metric
exports.addHealthMetric = async (req, res) => {
    try {
        const { metricType, value, secondaryValue, unit, recordedAt, source, notes } = req.body;

        if (!metricType || value === undefined || !unit) {
            return res.status(400).json({ message: 'metricType, value, and unit are required.' });
        }

        const metric = new HealthMetric({
            patientId: req.user._id,
            metricType,
            value,
            secondaryValue,
            unit,
            recordedAt: recordedAt || new Date(),
            source: source || 'manual',
            notes: notes || ''
        });

        await metric.save();
        res.status(201).json({ message: 'Health metric recorded.', metric });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add health metric.', error: error.message });
    }
};

// Get health metrics for a patient
exports.getHealthMetrics = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user._id;
        const { metricType, limit } = req.query;

        const query = { patientId };
        if (metricType) query.metricType = metricType;

        const metrics = await HealthMetric.find(query)
            .sort({ recordedAt: -1 })
            .limit(parseInt(limit) || 50);

        res.status(200).json(metrics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch health metrics.' });
    }
};

// Get trends for a patient
exports.getHealthTrends = async (req, res) => {
    try {
        const patientId = req.params.patientId || req.user._id;

        const trends = await HealthMetric.aggregate([
            { $match: { patientId: require('mongoose').Types.ObjectId.createFromHexString(String(patientId)) } },
            { $sort: { recordedAt: 1 } },
            {
                $group: {
                    _id: '$metricType',
                    readings: {
                        $push: {
                            value: '$value',
                            secondaryValue: '$secondaryValue',
                            unit: '$unit',
                            recordedAt: '$recordedAt'
                        }
                    },
                    count: { $sum: 1 },
                    avgValue: { $avg: '$value' },
                    minValue: { $min: '$value' },
                    maxValue: { $max: '$value' }
                }
            }
        ]);

        res.status(200).json(trends);
    } catch (error) {
        console.error('Health trends error:', error);
        res.status(500).json({ message: 'Failed to fetch health trends.' });
    }
};
