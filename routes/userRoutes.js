const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

router.get('/login', userControllers.getLoginPage);
router.post('/login', userControllers.login);
router.get('/activate', userControllers.getActivationPage);
router.post('/activate', userControllers.activate);
router.post('/logout', userControllers.logout);
module.exports = router;
