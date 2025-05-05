const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
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

// API route to fetch all sales (for AJAX)
router.get("/api/sales", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ dateTime: -1 });
    res.json(sales);
  } catch (err) {
    console.error("API error fetching sales:", err);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// Create new sale
router.post("/sales", async (req, res) => {
  const { produceName, tonnage, amount, buyerName, agentName, branchName } = req.body;

  if (!produceName || !tonnage || !amount || !buyerName || !agentName || !branchName) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const newSale = new Sale({
      produceName,
      tonnage,
      amount,
      buyerName,
      agentName,
      branchName,
    });

    await newSale.save();
    res.status(201).json({ message: "Sale recorded", sale: newSale });
  } catch (err) {
    console.error("Error saving sale:", err);
    res.status(500).send("Error recording sale");
  }
});

// Update an existing sale
router.put("/sales/:id", async (req, res) => {
  const { id } = req.params;
  const { produceName, tonnage, amount, buyerName, agentName, branchName } = req.body;

  try {
    const updatedSale = await Sale.findByIdAndUpdate(
      id,
      { produceName, tonnage, amount, buyerName, agentName, branchName },
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
