const express = require('express');
const { Testimonial } = require('../models');
const response = require('../utils/response');

const router = express.Router();

// GET /api/testimonials — public, returns active testimonials sorted by order
router.get('/', async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('name location text rating');
    return response.success(res, { data: testimonials });
  } catch (error) { next(error); }
});

module.exports = router;
