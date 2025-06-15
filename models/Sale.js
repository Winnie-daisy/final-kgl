// models/Sale.js
const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  produceName: { type: String, required: true },
  tonnage: { type: Number, required: true },
  amountPaid: { type: Number, required: true }, // Changed from amount to amountPaid
  buyerName: { type: String, required: true },
  dateTime: { type: Date, default: Date.now },
  agentName: { type: String, required: true },
  branch: { type: String, enum: ["Matugga", "Maganjo"], required: true }, // Changed from branchName to branch
});

module.exports = mongoose.model("Sale", saleSchema);
