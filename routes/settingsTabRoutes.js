const express = require('express');
const router = express.Router();
const settingsTabControllers = require('../controllers/settingsTabControllers');

router.get('/', settingsTabControllers.getInfo);
router.get('/authorizations', settingsTabControllers.getAuthorizations);
router.post('/update_authorizations', settingsTabControllers.updateAuthorizations);
router.post('/add_new_user', settingsTabControllers.addUser);
module.exports = router;
