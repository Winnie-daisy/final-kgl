// routes/saleRoutes.js
const express = require('express');
const router = express.Router();
const Sale =require('../models/Sale'); // Adjust the path to your Sale model


// GET route for sales page
router.get('/sales', async(req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if user is not authenticated
    }
    const sales = await Sale.find().sort({ date: -1}); // Fetch all sales from the database
  res.render('sales', {sales}); // this should match the name of your Pug view file: views/sales.pug
});


// POST route to add a new sale
router.post('/sales', async (req, res) => {
    const { productName, quantity, price } = req.body;
    const total = tonnage * amount; // Calculate total price

    // Validate input
    const newSale = new Sale({
        productName,
        tonnage,
        amount,
        buyerName, 
        dateTime: new Date(), // Use current date and time
        agentName,
        branchName,
    });

    try {
    await newSale.save(); // Save the new sale to the database
    res.redirect('/sales'); // Redirect back to the sales page
    
    } catch (err) {
        res.status(500).send(' Error recording sale'); // Handle error appropriately
    }
});

module.exports = router;
