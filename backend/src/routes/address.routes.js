const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const addressController = require('../controllers/address.controller');

const router = express.Router();

router.get('/', auth, addressController.getAddresses);

router.post('/',
  auth,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit pincode required'),
  ],
  validate,
  addressController.createAddress
);

router.put('/:id', auth, addressController.updateAddress);
router.delete('/:id', auth, addressController.deleteAddress);
router.put('/:id/default', auth, addressController.setDefault);

module.exports = router;
