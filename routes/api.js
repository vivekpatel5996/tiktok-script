const express = require('express');
const tiktok = require('../controllers/tiktok');
const router = express.Router();

router.post('/tiktok/session/start', tiktok.start);
router.post('/tiktok/login', tiktok.continueLogin);
router.post('/tiktok/uploadVideo', tiktok.uploadVideo);

module.exports = router;
