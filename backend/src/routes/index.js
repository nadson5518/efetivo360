const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'API Efetivo360 online' });
});

module.exports = router;
