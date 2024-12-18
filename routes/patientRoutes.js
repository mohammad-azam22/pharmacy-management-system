const express = require('express');
const router = express.Router();
const patientControllers = require('../controllers/patientControllers');

router.get('/register', patientControllers.getRegistrationPage);
router.post('/register', patientControllers.register);
module.exports = router;
