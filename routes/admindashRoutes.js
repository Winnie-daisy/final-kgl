const express = require('express');
const router = express.Router();

// Manager Dashboard Route
router.get('/admindashRoutes', (req, res) => {
    const user = req.session.user;
    res.render('admindash', { user });
});
  

module.exports = router;
