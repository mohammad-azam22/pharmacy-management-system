const express = require('express');
const router = express.Router();
const manageInventoryTabControllers = require('../controllers/manageInventoryTabControllers');

router.post('/add_medication', manageInventoryTabControllers.addMedication);
router.post('/remove_medications', manageInventoryTabControllers.discardMedications);
router.get('/expired_medications', manageInventoryTabControllers.getExpiredMedications);
router.get('/inactive_medications', manageInventoryTabControllers.getInactiveMedications);
router.get('/in_stock_medications', manageInventoryTabControllers.getInStockMedications);
module.exports = router;
