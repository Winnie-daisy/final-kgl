const express = require('express');
const router = express.Router();

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/admin/dashboard'); // Stay on dashboard if error
    }

    res.clearCookie('connect.sid'); // Clear session cookie
    res.redirect('/'); // Redirect to homepage (index)
  });
});

module.exports = router;
