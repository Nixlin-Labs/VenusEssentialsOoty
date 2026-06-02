const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { Enquiry } = require('../models');
const response = require('../utils/response');

const router = express.Router();

/**
 * POST /api/enquiries
 * Public: submit an enquiry
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('subject').notEmpty().withMessage('Subject is required').trim(),
    body('message').notEmpty().withMessage('Message is required').trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body;
      const enquiry = await Enquiry.create({ name, email, subject, message });
      return response.created(res, { data: enquiry }, 'Your enquiry has been submitted successfully.');
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
