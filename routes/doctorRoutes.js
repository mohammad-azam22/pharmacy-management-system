const express = require('express');
const router = express.Router();
const doctorControllers = require('../controllers/doctorControllers');

router.get('/register', doctorControllers.getRegistrationPage);
router.post('/register', doctorControllers.register);
module.exports = router;
