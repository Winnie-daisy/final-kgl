const express = require("express");
const router = express.Router();
const Credit = require("../models/Credit");
const Purchase = require("../models/Purchase");

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Helper function to check stock
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
  
  // Check if stock will fall below threshold after sale
  if (purchase.currentStock <= purchase.minStockThreshold) {
    // In a real app, this would trigger notifications to managers
    console.log(`Low stock alert: ${produceName} at ${branch} has ${purchase.currentStock}kg remaining`);
  }

  await purchase.save();
  return purchase;
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

// Fetch single credit sale by ID (for edit)
router.get("/credit/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const credit = await Credit.findById(id);

    if (!credit) {
      return res.status(404).send("Credit not found");
    }

    res.json(credit);
  } catch (err) {
    console.error("Error fetching credit:", err);
    res.status(500).send("Error fetching credit");
  }
});

// Create new credit sale with stock validation
router.post("/credit", async (req, res) => {
  const { buyerName, nationalId, location, contact, amountDue, saleAgent, dueDate, produceName, branch, tonnage, dispatchDate } = req.body;

  if (!buyerName || !nationalId || !location || !contact || !amountDue || !saleAgent || !dueDate || !produceName || !branch || !tonnage || !dispatchDate) {
    return res.status(400).send("Missing required fields");
  }

  const session = await Credit.startSession();
  try {
    await session.withTransaction(async () => {
      // Check and update stock
      await checkAndUpdateStock(produceName, tonnage, branch);

      // Create and save credit sale
      const newCredit = new Credit({
        buyerName,
        nationalId,
        location,
        contact,
        amountDue,
        saleAgent,
        dueDate,
        produceName,
        branch,
        tonnage,
        dispatchDate,
      });

      await newCredit.save({ session });
    });

    session.endSession();
    res.status(201).json({ message: "Credit sale recorded successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error saving credit sale:", err);
    res.status(500).send(err.message || "Error recording credit sale");
  }
});

// Update existing credit sale with stock validation
router.put("/credit/:id", async (req, res) => {
  const { id } = req.params;
  const { buyerName, nationalId, location, contact, amountDue, saleAgent, dueDate, produceName, branch, tonnage, dispatchDate } = req.body;

  const session = await Credit.startSession();
  try {
    await session.withTransaction(async () => {
      // Get original credit sale
      const originalCredit = await Credit.findById(id);
      if (!originalCredit) {
        throw new Error("Credit sale not found");
      }

      // If tonnage or product changed, update stock accordingly
      if (tonnage !== originalCredit.tonnage || produceName !== originalCredit.produceName || branch !== originalCredit.branch) {
        // Return old tonnage to stock
        const oldPurchase = await Purchase.findOne({
          produceName: originalCredit.produceName,
          branch: originalCredit.branch
        });
        if (oldPurchase) {
          oldPurchase.currentStock += originalCredit.tonnage;
          await oldPurchase.save({ session });
        }

        // Check and update new stock
        await checkAndUpdateStock(produceName, tonnage, branch);
      }

      // Update credit sale
      const updatedCredit = await Credit.findByIdAndUpdate(
        id,
        { buyerName, nationalId, location, contact, amountDue, saleAgent, dueDate, produceName, branch, tonnage, dispatchDate },
        { new: true, session }
      );

      if (!updatedCredit) {
        throw new Error("Failed to update credit sale");
      }
    });

    session.endSession();
    res.json({ message: "Credit sale updated successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating credit sale:", err);
    res.status(500).send(err.message || "Error updating credit sale");
  }
});

// Delete a credit sale
router.delete("/credit/:id", async (req, res) => {
  const { id } = req.params;
  const session = await Credit.startSession();

  try {
    await session.withTransaction(async () => {
      const creditSale = await Credit.findById(id);
      if (!creditSale) {
        throw new Error("Credit sale not found");
      }

      // Return tonnage to stock
      const purchase = await Purchase.findOne({
        produceName: creditSale.produceName,
        branch: creditSale.branch
      });

      if (purchase) {
        purchase.currentStock += creditSale.tonnage;
        await purchase.save({ session });
      }

      await Credit.findByIdAndDelete(id, { session });
    });

    session.endSession();
    res.json({ message: "Credit sale deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting credit:", err);
    res.status(500).send(err.message || "Error deleting credit sale");
  }
});

module.exports = router;
