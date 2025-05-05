const express = require("express");
const router = express.Router();
const Credit = require("../models/Credit");

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}
// Render credit page
router.get("/credit", isAuthenticated, async (req, res) => {
  try {
    const credit = await Credit.find().sort({ date: -1 });
    res.render("credit", { credit });
  } catch (err) {
    console.error("Error fetching credit sale:", err);
    res.status(500).send("Failed to load credit sale");
  }
});

// API route to fetch all credit (for AJAX)
router.get("/api/credit", isAuthenticated, async (req, res) => {
  try {
    const credit = await Credit.find().sort({ date: -1 });
    res.json(credit);
  } catch (err) {
    console.error("API error credit sale:", err);
    res.status(500).json({ error: "Failed to fetch credit sale" });
  }
});

// Create new credit sale
router.post("/credit", async (req, res) => {
  const { buyerName, nationalId, location, contact, amountDue, saleAgent, dueDate, produceName, produceType, tonnage, dispatchDate } = req.body;

  if (!buyerName || !nationalId || !location || !contact || !amountDue || !saleAgent || !dueDate || !produceName || !tonnage || !dispatchDate) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const newCredit = new Credit({
      buyerName,
      nationalId,
      location,
      contact,
      amountDue,
      saleAgent,
      dueDate,
      produceName,
      produceType,
      tonnage,
      dispatchDate,
    });

    await newCredit.save();
    res.status(201).json({ message: "Credit sale recorded", credit: newCredit });
  } catch (err) {
    console.error("Error saving credit sale:", err);
    res.status(500).send("Error recording cedit sale");
  }
});

//update existing credit sale
router.put("/credit/:id", async (req, res) => {
  const { id } = req.params;
  const { buyerName, nationalId, location, contact, amountDue, saleAgent, dueDate, produceName, produceType,  tonnage, dispatchDate } = req.body;

  try {
    const updatedCredit = await Credit.findByIdAndUpdate(
      id,
      { buyerName, nationalId, location, contact, amountDue, saleAgent, dueDate, produceName, produceType, tonnage, dispatchDate },
      { new: true }
    );

    if (!updatedCredit)  return res.status(404).send("credit not found");

      res.json({ message: "credit sale updated", credit: updatedCredit });
 } catch (err) {
    console.error("Error updating credit sale:", err);
    res.status(500).send("Error updating credit sale");
  }
});

// Delete a credit sale
router.delete("/credit/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCredit = await Credit.findByIdAndDelete(id);

    if (!deletedCredit) return res.status(404).send("Credi not found");

    res.json({ message: "Credit deleted" });
  } catch (err) {
    console.error("Error deleting credit:", err);
    res.status(500).send("Error deleting credit");
  }
});

module.exports = router;
