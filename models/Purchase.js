// models/Purchase.js
const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  produceName: { type: String, required: true },
  produceType: { type: String, required: true },
  date: { type: Date, default: Date.now },
  tonnage: { type: Number, required: true },
  cost: { type: Number, required: true },
  dealerName: { type: String, required: true },
  branchName: { type: String, required: true },
  contact: { type: String, required: true },
  sellingPrice: { type: String, required: true },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
