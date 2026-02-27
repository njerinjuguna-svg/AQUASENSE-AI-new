const Reading = require('../models/Reading');
const Sensor = require('../models/Sensor');
const Alert = require('../models/Alert');
const {
  classifyPH, classifyTurbidity, classifyDO, classifyTemperature,
  calculateRiskLevel, generateExplanation, shouldTriggerAlert
} = require('../utils/complianceEngine');

// POST /api/readings/upload  (called by hardware sensors using API key)
exports.uploadReading = async (req, res) => {
  try {
    const { api_key, ph, turbidity, temperature, tds, dissolved_oxygen, flow_rate } = req.body;

    // Input validation
    if (!api_key) {
      return res.status(400).json({ message: 'api_key is required.' });
    }

    // Authenticate sensor by API key
    const sensor = await Sensor.findOne({ where: { api_key } });
    if (!sensor) {
      return res.status(401).json({ message: 'Invalid API key. Access denied.' });
    }

    if (sensor.status === 'inactive') {
      return res.status(403).json({ message: 'This sensor is inactive.' });
    }

    // Run compliance classification
    const phResult = classifyPH(ph);
    const turbResult = classifyTurbidity(turbidity);
    const doResult = classifyDO(dissolved_oxygen);
    const tempResult = classifyTemperature(temperature);

    // Calculate overall risk level
    const { risk_level, reasons } = calculateRiskLevel(ph, turbidity, dissolved_oxygen, temperature);

    // Fetch sensor owner's organization_type for personalized explanation
    const User = require('../models/User');
    const owner = await User.findByPk(sensor.userId, { attributes: ['organization_type'] });
    const ai_explanation = generateExplanation(ph, turbidity, dissolved_oxygen, risk_level, owner?.organization_type);

    // Save reading
    const newReading = await Reading.create({
      sensorId: sensor.id,
      ph, turbidity, temperature, tds, dissolved_oxygen, flow_rate,
      risk_level,
      ai_explanation
    });

    // Auto-generate alert if quality is not optimum
    let alert = null;
    if (shouldTriggerAlert(ph, turbidity, dissolved_oxygen)) {
      const severity = (risk_level === 'CRITICAL' || risk_level === 'HIGH') ? 'CRITICAL' : 'WARNING';
      const alertMsg = `Quality issue detected on sensor "${sensor.sensor_name}". Risk: ${risk_level}. ${reasons.join('. ')}. ${ai_explanation}`;
      alert = await Alert.create({
        ReadingId: newReading.id,
        severity,
        message: alertMsg
      });
    }

    // Build response (matches Handoff Doc Section 6 expected output format)
    const response = {
      message: 'Reading recorded and analyzed.',
      risk_level,
      ai_explanation,
      analysis: {}
    };

    if (phResult)   response.analysis.pH               = phResult;
    if (turbResult) response.analysis.Turbidity        = turbResult;
    if (doResult)   response.analysis.Dissolved_Oxygen = doResult;
    if (tempResult) response.analysis.Temperature      = tempResult;
    if (alert)      response.alert_triggered = { severity: alert.severity, message: 'Alert generated.' };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error processing reading.', error: error.message });
  }
};

// GET /api/readings/sensor/:sensorId  (protected - view reading history)
exports.getReadingsForSensor = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Verify sensor belongs to this user
    const sensor = await Sensor.findOne({ where: { id: sensorId, userId: req.user.id } });
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found or access denied.' });
    }

    const readings = await Reading.findAll({
      where: { sensorId },
      order: [['createdAt', 'DESC']],
      limit
    });

    res.status(200).json({ sensorId, count: readings.length, readings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching readings.', error: error.message });
  }
};
