const { getAdminAnalytics } = require('../services/analytics/analyticsService');

exports.getAnalytics = async (req, res) => {
    try {
        const analytics = await getAdminAnalytics();
        res.status(200).json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics.' });
    }
};
