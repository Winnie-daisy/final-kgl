const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema({
  buyerName: { type: String, required: true },
  nationalId: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  amountDue: { type: Number, required: true },
  saleAgent: { type: String, required: true },
  dueDate: { type: Date, required: true },
  produceName: { type: String, required: true },
  branch: { type: String, enum: ["Matugga", "Maganjo"], required: true },
  tonnage: { type: Number, required: true },
  dispatchDate: { type: Date, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Partial", "Paid"], default: "Pending" }
});

module.exports = mongoose.model("Credit", creditSchema);