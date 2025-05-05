const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  buyerName: { type: String, required: true },
  nationalId: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: Number, required: true },
  amountDue: { type: Number, required: true },
  saleAgent: { type: String, required: true },
  dueDate: { type: String, required: true },
  produceName: { type: String, required: true },
  produceType: { type: String, required: true },
  tonnage: { type: Number, required: true },
  dispatchDate: { type: Date, required: true },
});

module.exports = mongoose.model('Credit', creditSchema);