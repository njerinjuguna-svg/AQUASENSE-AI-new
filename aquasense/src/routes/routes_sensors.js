const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register',                protect, sensorController.registerSensor);
router.get('/my-sensors',               protect, sensorController.getMySensors);
router.get('/analytics/:sensorId',      protect, sensorController.getSensorAnalytics);
router.get('/:sensorId',                protect, sensorController.getSensorById);

module.exports = router;