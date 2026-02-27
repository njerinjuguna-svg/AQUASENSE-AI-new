const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-alerts', protect, alertController.getUserAlerts);
router.patch('/resolve/:id', protect, alertController.resolveAlert);

module.exports = router;
