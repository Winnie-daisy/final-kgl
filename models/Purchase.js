// models/Purchase.js
const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  produceName: { type: String, required: true },
  produceType: { type: String, required: true },
  date: { type: Date, default: Date.now },
  tonnage: { type: Number, required: true },
  currentStock: { type: Number, default: function() { return this.tonnage; } },
  minStockThreshold: { type: Number, default: 1000 },
  cost: { type: Number, required: true },
  dealerName: { type: String, required: true },
  branch: { type: String, enum: ["Matugga", "Maganjo"], required: true },
  contact: { type: String, required: true },
  sellingPrice: { type: Number, required: true }
});

purchaseSchema.index({ branch: 1, produceName: 1 });

module.exports = mongoose.model("Purchase", purchaseSchema);
