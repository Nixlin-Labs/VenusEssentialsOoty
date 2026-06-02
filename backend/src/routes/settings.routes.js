const express = require('express');
const { Settings } = require('../models');
const response = require('../utils/response');

const router = express.Router();

/**
 * GET /api/settings
 * Public: get global settings
 */
router.get('/', async (req, res, next) => {
  try {
    const settingsList = await Settings.find({});
    const formattedSettings = {};
    settingsList.forEach(s => {
      formattedSettings[s.key] = s.value;
    });
    return response.success(res, { data: formattedSettings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
