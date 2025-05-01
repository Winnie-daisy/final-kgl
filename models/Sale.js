// models/Sale.js
const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  produceName: { type: String, required: true },
  tonnage: { type: Number, required: true },
  amount: { type: Number, required: true },
  buyerName: { type: String, required: true },
  dateTime: { type: Date, default: Date.now },
  agentName: { type: String, required: true },
  branchName: { type: String, required: true },
});

module.exports = mongoose.model("Sale", saleSchema);
