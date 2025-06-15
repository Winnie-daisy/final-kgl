const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const Credit = require('../models/Credit');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Middleware to check if user is manager
function isManager(req, res, next) {
  if (!req.session.user || req.session.user.userType !== 'manager') {
    return res.status(403).json({ error: "Access denied. Managers only." });
  }
  next();
}

// Helper to exclude null/undefined/empty/invalid branches
const isValidBranch = { $nin: [null, "", "null", "undefined", "Unknown"] };

// Render purchase page
router.get("/purchase", isAuthenticated, (req, res) => {
  res.render("purchase");
});

// Get all purchases
router.get("/api/purchase", isAuthenticated, async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ date: -1 });
    res.json(purchases);
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// Get single purchase
router.get("/api/purchase/:id", isAuthenticated, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    res.json(purchase);
  } catch (err) {
    console.error("Error fetching purchase:", err);
    res.status(500).json({ error: "Failed to fetch purchase" });
  }
});

// Create new purchase
router.post("/api/purchase", isAuthenticated, async (req, res) => {
  try {
    const {
      produceName,
      produceType,
      date,
      tonnage,
      cost,
      dealerName,
      branch,
      contact,
      sellingPrice
    } = req.body;

    // Validate required fields
    if (!produceName || !produceType || !tonnage || !cost || !dealerName || !branch || !contact || !sellingPrice) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create new purchase with initial currentStock equal to tonnage
    const purchase = new Purchase({
      produceName,
      produceType,
      date: date || new Date(),
      tonnage: parseFloat(tonnage),
      currentStock: parseFloat(tonnage), // Initialize currentStock with tonnage
      cost: parseFloat(cost),
      dealerName,
      branch,
      contact,
      sellingPrice: parseFloat(sellingPrice),
      minStockThreshold: 1000 // Default threshold, can be adjusted
    });

    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    console.error("Error creating purchase:", err);
    res.status(500).json({ error: "Failed to create purchase" });
  }
});

// Update purchase
router.put("/api/purchase/:id", isAuthenticated, async (req, res) => {
  try {
    const {
      produceName,
      produceType,
      date,
      tonnage,
      cost,
      dealerName,
      branch,
      contact,
      sellingPrice
    } = req.body;

    // Get original purchase to calculate stock difference
    const originalPurchase = await Purchase.findById(req.params.id);
    if (!originalPurchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Calculate the difference in tonnage
    const tonnageDiff = parseFloat(tonnage) - originalPurchase.tonnage;
    
    // Update current stock based on the tonnage difference
    const currentStock = originalPurchase.currentStock + tonnageDiff;
    
    if (currentStock < 0) {
      return res.status(400).json({ error: "Cannot reduce tonnage below current stock level" });
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        produceName,
        produceType,
        date: date || originalPurchase.date,
        tonnage: parseFloat(tonnage),
        currentStock,
        cost: parseFloat(cost),
        dealerName,
        branch,
        contact,
        sellingPrice: parseFloat(sellingPrice)
      },
      { new: true }
    );

    res.json(updatedPurchase);
  } catch (err) {
    console.error("Error updating purchase:", err);
    res.status(500).json({ error: "Failed to update purchase" });
  }
});

// Delete purchase
router.delete("/api/purchase/:id", isAuthenticated, async (req, res) => {
  try {
    // Check if purchase exists and has no associated sales
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Check if the purchase has any associated sales
    if (purchase.currentStock < purchase.tonnage) {
      return res.status(400).json({ 
        error: "Cannot delete purchase record with associated sales. Some stock has already been sold." 
      });
    }

    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: "Purchase deleted successfully" });
  } catch (err) {
    console.error("Error deleting purchase:", err);
    res.status(500).json({ error: "Failed to delete purchase" });
  }
});

// Get low stock alerts
router.get('/api/stock-alerts', isManager, async (req, res) => {
  try {
    const branch = req.session.user.branch;
    const lowStockItems = await Purchase.find({
      branch: branch,
      currentStock: { $lte: "$minStockThreshold" }
    });

    res.json(lowStockItems);
  } catch (err) {
    console.error("Error fetching stock alerts:", err);
    res.status(500).json({ error: "Failed to fetch stock alerts" });
  }
});

module.exports = router;
