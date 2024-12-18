const express = require('express');
const router = express.Router();
const dispenseMedicationTabControllers = require('../controllers/dispenseMedicationTabControllers');

router.get('/update_medication_status', dispenseMedicationTabControllers.updateMedicationStatus);
router.post('/batch_nums', dispenseMedicationTabControllers.getBatchNums);
router.post('/checkup_doc_details', dispenseMedicationTabControllers.getDoctorDetails);
router.post('/execute_transaction', dispenseMedicationTabControllers.executeTransaction);
router.post('/medication_names', dispenseMedicationTabControllers.getMedicationNames);
router.post('/checkup_pat_details', dispenseMedicationTabControllers.getPatientDetails);
router.post('/quantity', dispenseMedicationTabControllers.getQuantity);
router.post('/unit_price', dispenseMedicationTabControllers.getUnitPrice);
module.exports = router;
