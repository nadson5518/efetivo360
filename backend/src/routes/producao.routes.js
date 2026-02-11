const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { salvarProducao } = require('../controllers/producao.controller');

router.post('/producao', auth, salvarProducao);

module.exports = router;
