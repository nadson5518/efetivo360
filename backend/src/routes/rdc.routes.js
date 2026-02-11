const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { salvarRDC, listarRDC } = require('../controllers/rdc.controller');

router.post('/rdc', auth, salvarRDC);
router.get('/rdc', auth, listarRDC);

module.exports = router;
