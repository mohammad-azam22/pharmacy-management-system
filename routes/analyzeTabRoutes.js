const express = require('express');
const router = express.Router();
const analyzeTabControllers = require('../controllers/analyzeTabControllers');

router.post('/chart_data', analyzeTabControllers.getChartData);
module.exports = router;
