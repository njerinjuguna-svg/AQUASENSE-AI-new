const Sensor = require('../models/Sensor');
const Reading = require('../models/Reading');
const crypto = require('crypto');
const { Op } = require('sequelize');

function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// POST /api/sensors/register
exports.registerSensor = async (req, res) => {
  try {
    const { sensor_name, location } = req.body;
    const userId = req.user.id;

    if (!sensor_name) {
      return res.status(400).json({ message: 'sensor_name is required.' });
    }

    const rawApiKey = `AQ-${crypto.randomBytes(32).toString('hex')}`;
    const hashedApiKey = hashApiKey(rawApiKey);

    const newSensor = await Sensor.create({
      sensor_name,
      location,
      api_key: rawApiKey,
      api_key_hash: hashedApiKey,
      userId
    });

    res.status(201).json({
      message: 'Sensor registered successfully.',
      sensorId: newSensor.id,
      sensor_name: newSensor.sensor_name,
      apiKey: rawApiKey,
      warning: 'Save this API key now. It will not be shown again in production.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering sensor.', error: error.message });
  }
};

// GET /api/sensors/my-sensors
exports.getMySensors = async (req, res) => {
  try {
    const userId = req.user.id;
    const sensors = await Sensor.findAll({
      where: { userId },
      attributes: { exclude: ['api_key', 'api_key_hash'] }
    });
    res.status(200).json(sensors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensors.', error: error.message });
  }
};

// GET /api/sensors/:sensorId
exports.getSensorById = async (req, res) => {
  try {
    const { sensorId } = req.params;

    const sensor = await Sensor.findOne({
      where: { id: sensorId, userId: req.user.id },
      attributes: { exclude: ['api_key', 'api_key_hash'] }
    });

    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found or access denied.' });
    }

    res.status(200).json(sensor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensor.', error: error.message });
  }
};

// GET /api/sensors/analytics/:sensorId
exports.getSensorAnalytics = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

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

    const half = Math.floor(readings.length / 2);
    let phTrend = 'stable', turbTrend = '