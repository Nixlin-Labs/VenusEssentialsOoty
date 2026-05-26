const express = require('express');
const cmsController = require('../controllers/cms.controller');

const router = express.Router();

router.get('/pages/:slug', cmsController.getPage);
router.get('/banners', cmsController.getBanners);
router.get('/homepage', cmsController.getHomepageData);

module.exports = router;
