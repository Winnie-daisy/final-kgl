const express = require('express');
const router = express.Router();

// Manager Dashboard Route
router.get('/mdashRoutes', (req, res) => {
    const user = req.session.user;
    res.render('mdashboard', { user });
});
  

module.exports = router;
