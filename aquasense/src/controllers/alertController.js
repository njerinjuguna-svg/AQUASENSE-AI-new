const Alert = require('../models/Alert');
const Reading = require('../models/Reading');
const Sensor = require('../models/Sensor');

// GET /api/alerts/user  (protected - get alerts for logged-in user's sensors)
exports.getUserAlerts = async (req, res) => {
  try {
    const userId = req.user.id;

    const alerts = await Alert.findAll({
      include: [{
        model: Reading,
        include: [{
          model: Sensor,
          where: { userId },
          attributes: ['sensor_name', 'location']
        }],
        attributes: ['ph', 'turbidity', 'dissolved_oxygen', 'risk_level', 'createdAt']
      }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.status(200).json({ count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts.', error: error.message });
  }
};

// PATCH /api/alerts/resolve/:id  (protected)
exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByPk(id, {
      include: [{
        model: Reading,
        include: [{ model: Sensor, where: { userId: req.user.id } }]
      }]
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or access denied.' });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({ message: 'Alert is already resolved.' });
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    await alert.save();

    res.status(200).json({ message: 'Alert resolved successfully.', alert });
  } catch (error) {
    res.status(500).json({ message: 'Error resolving alert.', error: error.message });
  }
};
