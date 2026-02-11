const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { listarEquipe, adicionarMembro } = require('../controllers/equipe.controller');

router.get('/equipe', auth, listarEquipe);
router.post('/equipe', auth, adicionarMembro);

module.exports = router;
