const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  stripePaymentIntentId: { type: String, required: true },
  paymentMethodType: { type: String, enum: ["card", "upi"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);

