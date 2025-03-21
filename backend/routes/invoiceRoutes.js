const express = require('express');
const { getInvoice, addInvoice, updateInvoice, deleteInvoice, changeInvoiceStatus } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware'); // Rename authMiddleware to protect
const router = express.Router();

router.route('/').get(protect, getInvoice).post(protect, addInvoice);
router.route('/:id').put(protect, updateInvoice).delete(protect, deleteInvoice);
router.route('/:id/status').patch(protect, changeInvoiceStatus); // Status update route

module.exports = router;
