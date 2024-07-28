const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  imageUrl: String,
  lowStockLevel: { type: Number, default: 10 },
});

module.exports = mongoose.model("Product", productSchema);
