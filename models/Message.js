const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
