const express = require('express');
const router = express.Router();
const dashboardTabControllers = require('../controllers/dashboardTabControllers');

router.get('/', dashboardTabControllers.getInfo);

module.exports = router;
