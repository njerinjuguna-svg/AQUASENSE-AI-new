const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');
const { protect } = require('../middleware/authMiddleware');

// Upload is NOT protected by JWT - sensor hardware uses api_key in body instead
router.post('/upload', readingController.uploadReading);

// Viewing readings requires JWT login
router.get('/sensor/:sensorId', protect, readingController.getReadingsForSensor);

module.exports = router;
