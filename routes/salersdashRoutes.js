const express = require('express');
const router = express.Router();

// Manager Dashboard Route
router.get('/salersdashRoutes', (req, res) => {
    const user = req.session.user;
    res.render('salerdash', { user });
});
  

module.exports = router;
