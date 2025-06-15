const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Signup = require("../models/Signup");

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Helper function to notify managers
async function notifyManagers(branch, produceName, currentStock) {
  try {
    const managers = await Signup.find({ 
      userType: 'manager',
      branch: branch 
    });
    
    // In a real application, you would send emails/notifications here
    console.log(`Low stock alert for ${branch}: ${produceName} has ${currentStock}kg remaining`);
  } catch (err) {
    console.error("Error notifying managers:", err);
  }
}

// Check stock availability and update
async function checkAndUpdateStock(produceName, tonnage, branch) {
  const purchase = await Purchase.findOne({ 
    produceName: produceName,
    branch: branch
  });

  if (!purchase) {
    throw new Error("Product not found in stock");
  }

  if (purchase.currentStock < tonnage) {
    throw new Error(`Insufficient stock. Only ${purchase.currentStock}kg available`);
  }

  // Update stock levels
  purchase.currentStock -= tonnage;
  await purchase.save();

  // Check if stock will fall below threshold after sale
  if (purchase.currentStock <= purchase.minStockThreshold) {
    await notifyManagers(branch, produceName, purchase.currentStock);
  }

  return purchase;
}

// Render sales page
router.get("/sales", isAuthenticated, async (req, res) => {
  try {
    const sales = await Sale.find().sort({ dateTime: -1 });
    res.render("sales", { sales });
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).send("Failed to load sales");
  }
});

// API route to fetch all sales
router.get("/api/sales", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ dateTime: -1 });
    res.json(sales);
  } catch (err) {
    console.error("API error fetching sales:", err);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// Check stock availability endpoint
router.get("/api/check-stock/:produceName/:branch", async (req, res) => {
  try {
    const { produceName, branch } = req.params;
    const purchase = await Purchase.findOne({ 
      produceName: produceName,
      branch: branch
    });

    if (!purchase) {
      return res.status(404).json({ error: "Product not found in stock" });
    }

    res.json({ 
      currentStock: purchase.currentStock,
      minThreshold: purchase.minStockThreshold,
      isLow: purchase.currentStock <= purchase.minStockThreshold
    });
  } catch (err) {
    console.error("Error checking stock:", err);
    res.status(500).json({ error: "Failed to check stock" });
  }
});

// Create new sale
router.post("/sales", async (req, res) => {
  const { produceName, tonnage, amountPaid, buyerName, agentName, branch } = req.body;

  if (!produceName || !tonnage || !amountPaid || !buyerName || !agentName || !branch) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Check stock and update it
    await checkAndUpdateStock(produceName, tonnage, branch);

    // Create and save the new sale
    const newSale = new Sale({
      produceName,
      tonnage,
      amountPaid,
      buyerName,
      agentName,
      branch,
    });

    await newSale.save();
    res.status(201).json({ message: "Sale recorded", sale: newSale });
  } catch (err) {
    console.error("Error saving sale:", err);
    res.status(500).send(err.message || "Error recording sale");
  }
});

// Update an existing sale
router.put("/sales/:id", async (req, res) => {
  const { id } = req.params;
  const { produceName, tonnage, amountPaid, buyerName, agentName, branch } = req.body;

  try {
    const updatedSale = await Sale.findByIdAndUpdate(
      id,
      { produceName, tonnage, amountPaid, buyerName, agentName, branch },
      { new: true }
    );

    if (!updatedSale) return res.status(404).send("Sale not found");

    res.json({ message: "Sale updated", sale: updatedSale });
  } catch (err) {
    console.error("Error updating sale:", err);
    res.status(500).send("Error updating sale");
  }
});

// Delete a sale
router.delete("/sales/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Sale.findByIdAndDelete(id);
    if (!deleted) return res.status(404).send("Sale not found");

    res.json({ message: "Sale deleted" });
  } catch (err) {
    console.error("Error deleting sale:", err);
    res.status(500).send("Error deleting sale");
  }
});

module.exports = router;
