const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}
// Render purchase page
router.get("/purchase", isAuthenticated, async (req, res) => {
  try {
    const purchase = await Purchase.find().sort({ date: -1 });
    res.render("purchase", { purchase });
  } catch (err) {
    console.error("Error fetching purchase:", err);
    res.status(500).send("Failed to load purchase");
  }
});

// API route to fetch all purchases (for AJAX)
router.get("/api/purchase", isAuthenticated, async (req, res) => {
  try {
    const purchase = await Purchase.find().sort({ date: -1 });
    res.json(purchase);
  } catch (err) {
    console.error("API error fetching purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// Create new purchase
router.post("/purchase", async (req, res) => {
  const { produceName, produceType, date, tonnage, cost, dealerName, branchName, contact, sellingPrice } = req.body;

  if (!produceName || !produceType || !date || !tonnage || !cost || !dealerName || !branchName || !contact || !sellingPrice) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const newPurchase = new Purchase({
      produceName,
      produceType,
      date,
      tonnage,
      cost,
      dealerName,
      branchName,
      contact,
      sellingPrice,
    });

    await newPurchase.save();
    res.status(201).json({ message: "Purchase recorded", purchase: newPurchase });
  } catch (err) {
    console.error("Error saving purchase:", err);
    res.status(500).send("Error recording purchase");
  }
});

//update existing purchase
router.put("/purchase/:id", async (req, res) => {
  const { id } = req.params;
  const { produceName, produceType, date, tonnage, cost, dealerName, branchName, contact, sellingPrice } = req.body;

  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      id,
      { produceName, produceType, date, tonnage, cost, dealerName, branchName, contact, sellingPrice,},
      { new: true }
    );

    if (!updatedPurchase)  return res.status(404).send("Purchase not found");

      res.json({ message: "purchase updated", purchase: updatedPurchase });
 } catch (err) {
    console.error("Error updating purchase:", err);
    res.status(500).send("Error updating purchase");
  }
});

// Delete a purchase
router.delete("/purchase/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPurchase = await Purchase.findByIdAndDelete(id);

    if (!deletedPurchase) return res.status(404).send("Purchase not found");

    res.json({ message: "Purchase deleted" });
  } catch (err) {
    console.error("Error deleting purchase:", err);
    res.status(500).send("Error deleting purchase");
  }
});

module.exports = router;
