const express = require('express');
const router = express.Router();

const adminConfigController = require('../controllers/adminConfig.controller');


router.get('/system-config', adminConfigController.getSystemConfig);

router.put(
  '/system-config', 
  adminConfigController.updateSystemConfig
);

module.exports = router;