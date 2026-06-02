const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { NewsletterSubscriber } = require('../models');
const response = require('../utils/response');

const router = express.Router();

/**
 * POST /api/newsletter/subscribe
 * Public: subscribe an email
 */
router.post(
  '/subscribe',
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      // Check if already subscribed
      const existing = await NewsletterSubscriber.findOne({ email });
      if (existing) {
        if (existing.isActive) {
          return response.success(res, {}, 'You are already subscribed!');
        }
        // Re-subscribe
        existing.isActive = true;
        existing.unsubscribedAt = null;
        await existing.save();
        return response.success(res, {}, 'Welcome back! You have been re-subscribed.');
      }

      await NewsletterSubscriber.create({ email, source: 'website' });
      return response.success(res, {}, 'Successfully subscribed! Welcome to the Nilgiri Circle.');
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
