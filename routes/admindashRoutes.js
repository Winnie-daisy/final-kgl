const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Credit = require('../models/Credit');
const Purchase = require('../models/Purchase');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Admin Dashboard Page Route
router.get('/admin/dashboard', isAuthenticated, (req, res) => {
  const user = req.user || req.session.user;
  res.render('admindash', { user });
});

// Stock per branch with value calculation
router.get('/api/dashboard/stock-summary', isAuthenticated, async (req, res) => {
  try {
    const stock = await Purchase.aggregate([
      {
        $group: {
          _id: "$branch",
          totalStock: { $sum: "$currentStock" },
          totalValue: {
            $sum: { $multiply: ["$currentStock", "$sellingPrice"] }
          }
        }
      },
      {
        $project: {
          _id: 1,
          totalStock: { $round: ["$totalStock", 2] },
          totalValue: { $round: ["$totalValue", 2] }
        }
      }
    ]);
    
    res.json(stock);
  } catch (err) {
    console.error("Error in stock summary:", err);
    res.status(500).json({ error: "Failed to aggregate stock data" });
  }
});

// Total sales (cash + credit) per branch
router.get('/api/dashboard/sales-summary', isAuthenticated, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [sales, creditSales] = await Promise.all([
      Sale.aggregate([
        {
          $match: {
            dateTime: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: "$branch",
            totalAmount: { $sum: "$amountPaid" },
            totalTonnage: { $sum: "$tonnage" }
          }
        }
      ]),
      Credit.aggregate([
        {
          $match: {
            dispatchDate: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: "$branch",
            totalAmount: { $sum: "$amountPaid" },
            totalTonnage: { $sum: "$tonnage" }
          }
        }
      ])
    ]);

    // Combine sales data
    const combined = {};
    sales.forEach(s => {
      combined[s._id] = {
        totalAmount: Math.round(s.totalAmount * 100) / 100,
        totalTonnage: Math.round(s.totalTonnage * 100) / 100
      };
    });

    creditSales.forEach(c => {
      if (!combined[c._id]) {
        combined[c._id] = {
          totalAmount: Math.round(c.totalAmount * 100) / 100,
          totalTonnage: Math.round(c.totalTonnage * 100) / 100
        };
      } else {
        combined[c._id].totalAmount += Math.round(c.totalAmount * 100) / 100;
        combined[c._id].totalTonnage += Math.round(c.totalTonnage * 100) / 100;
      }
    });

    res.json(combined);
  } catch (err) {
    console.error("Error in sales summary:", err);
    res.status(500).json({ error: "Failed to aggregate sales data" });
  }
});

// Credit sales summary
router.get('/api/dashboard/credit-summary', isAuthenticated, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const creditSales = await Credit.aggregate([
      {
        $match: {
          dispatchDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: "$branch",
          totalAmount: { $sum: "$amountDue" },
          totalTonnage: { $sum: "$tonnage" }
        }
      }
    ]);

    // Format response in the same structure as sales summary
    const formattedResponse = {};
    creditSales.forEach(sale => {
      formattedResponse[sale._id] = {
        totalAmount: Math.round(sale.totalAmount * 100) / 100,
        totalTonnage: Math.round(sale.totalTonnage * 100) / 100
      };
    });

    res.json(formattedResponse);
  } catch (err) {
    console.error("Error in credit summary:", err);
    res.status(500).json({ error: "Failed to aggregate credit data" });
  }
});

// Top products by sales
router.get('/api/dashboard/top-sales', isAuthenticated, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const topSales = await Sale.aggregate([
      {
        $match: {
          dateTime: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: {
            branch: "$branch",
            produceName: "$produceName"
          },
          totalAmount: { $sum: "$amountPaid" },
          totalTonnage: { $sum: "$tonnage" }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $group: {
          _id: "$_id.branch",
          topProduct: {
            $first: {
              name: "$_id.produceName",
              amount: { $round: ["$totalAmount", 2] },
              tonnage: { $round: ["$totalTonnage", 2] }
            }
          }
        }
      }
    ]);

    res.json(topSales);
  } catch (err) {
    console.error("Error in top sales:", err);
    res.status(500).json({ error: "Failed to aggregate top sales data" });
  }
});

// Stock alerts
router.get('/api/stock-alerts', isAuthenticated, async (req, res) => {
  try {
    const alerts = await Purchase.find({
      currentStock: { $lte: "$minStockThreshold" }
    }).select('produceName currentStock branch minStockThreshold');

    res.json(alerts);
  } catch (err) {
    console.error("Error fetching stock alerts:", err);
    res.status(500).json({ error: "Failed to fetch stock alerts" });
  }
});

module.exports = router;
