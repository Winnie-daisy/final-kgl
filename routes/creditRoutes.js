// routes/creditRoutes.js
const express = require('express');
const router = express.Router();

router.get('/credit', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if user is not authenticated
    }
  res.render('credit'); // this should match the name of your Pug view file: views/sales.pug
});

module.exports = router;
