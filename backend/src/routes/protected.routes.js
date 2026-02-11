const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Acesso autorizado',
    usuario: req.usuario
  });
});

module.exports = router;
