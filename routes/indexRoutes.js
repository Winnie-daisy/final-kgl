const express = require('express');
const router = express.Router();

// Manager Dashboard Route
router.get('/', (req, res) => {
    res.render('index');
});
  

module.exports = router;