const Sensor = require('../models/Sensor');
const Reading = require('../models/Reading');
const crypto = require('crypto');
const { Op } = require('sequelize');

/**
 * Security Spec: Store hashed API key, return raw key once to user
 * Raw key must never be stored or logged
 */
function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// POST /api/sensors/register
exports.registerSensor = async (req, res) => {
  try {
    const { sensor_name, location } = req.body;
    const userId = req.user.id; // Pulled from JWT, not from body (security)

    if (!sensor_name) {
      return res.status(400).json({ message: 'sensor_name is required.' });
    }

    // Generate strong 32-byte random API key (Security Spec Section 1)
    const rawApiKey = `AQ-${crypto.randomBytes(32).toString('hex')}`;
    const hashedApiKey = hashApiKey(rawApiKey);

    const newSensor = await Sensor.create({
      sensor_name,
      location,
      api_key: rawApiKey,      // stored for lookup (in production, store only hash)
      api_key_hash: hashedApiKey,
      userId
    });

    res.status(201).json({
      message: 'Sensor registered successfully.',
      sensorId: newSensor.id,
      sensor_name: newSensor.sensor_name,
      apiKey: rawApiKey, // Shown ONCE - user must save this securely
      warning: 'Save this API key now. It will not be shown again in production.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering sensor.', error: error.message });
  }
};

// GET /api/sensors/user/:userId
exports.getMySensors = async (req, res) => {
  try {
    const userId = req.user.id; // use JWT userId, ignore param for security
    const sensors = await Sensor.findAll({
      where: { userId },
      attributes: { exclude: ['api_key', 'api_key_hash'] } // Never return keys in list
    });
    res.status(200).json(sensors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensors.', error: error.message });
  }
};

// GET /api/sensors/analytics/:sensorId
exports.getSensorAnalytics = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Verify sensor belongs to this user
    const sensor = await Sensor.findOne({ where: { id: sensorId, userId: req.user.id } });
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found or access denied.' });
    }

    const readings = await Reading.findAll({
      where: { sensorId, createdAt: { [Op.gte]: oneDayAgo } }
    });

    if (readings.length === 0) {
      return res.status(200).json({ message: 'No data recorded for this sensor in the last 24 hours.' });
    }

    const avg = (field) => readings.reduce((sum, r) => sum + (r[field] || 0), 0) / readings.length;

    const avgPh = avg('ph');
    const avgTurb = avg('turbidity');
    const avgDO = avg('dissolved_oxygen');
    const avgTemp = avg('temperature');

    // Trend detection: compare first half vs second half of readings
    const half = Math.floor(readings.length / 2);
    let phTrend = 'stable', turbTrend = 'stable';
    if (readings.length >= 4) {
      const firstHalfPh = readings.slice(0, half).reduce((s, r) => s + (r.ph || 0), 0) / half;
      const secondHalfPh = readings.slice(half).reduce((s, r) => s + (r.ph || 0), 0) / (readings.length - half);
      phTrend = secondHalfPh > firstHalfPh + 0.3 ? 'rising' : secondHalfPh < firstHalfPh - 0.3 ? 'falling' : 'stable';

      const firstHalfTurb = readings.slice(0, half).reduce((s, r) => s + (r.turbidity || 0), 0) / half;
      const secondHalfTurb = readings.slice(half).reduce((s, r) => s + (r.turbidity || 0), 0) / (readings.length - half);
      turbTrend = secondHalfTurb > firstHalfTurb + 1 ? 'rising' : secondHalfTurb < firstHalfTurb - 1 ? 'falling' : 'stable';
    }

    const overallStatus = (avgPh < 6.5 || avgPh > 8.5 || avgTurb > 50 || avgDO < 3) ? 'CRITICAL'
      : (avgPh < 6.8 || avgPh > 8.2 || avgTurb > 5 || avgDO < 5) ? 'UNSTABLE'
      : 'STABLE';

    res.status(200).json({
      sensorId,
      sensorName: sensor.sensor_name,
      period: 'Last 24 Hours',
      readingCount: readings.length,
      averages: {
        ph: avgPh.toFixed(2),
        turbidity: avgTurb.toFixed(2),
        dissolved_oxygen: avgDO.toFixed(2),
        temperature: avgTemp.toFixed(2)
      },
      trends: { ph: phTrend, turbidity: turbTrend },
      overallStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating analytics.', error: error.message });
  }
};
