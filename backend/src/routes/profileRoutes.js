const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/health', profileController.getMyHealth);
router.put('/health', profileController.upsertMyHealth);

module.exports = router;

