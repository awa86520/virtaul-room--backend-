const mongoose = require("mongoose");
const Deal = require("../models/Deal");
const redisClient = require("../config/redis"); // Ensure Redis is properly configured

exports.createDeal = async (req, res) => {
  try {
    const { title, description, price, counterpartyId, status } = req.body;

    
    if (!title || !description || !price || !counterpartyId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }


    if (!mongoose.Types.ObjectId.isValid(counterpartyId)) {
      return res.status(400).json({ error: "Invalid counterpartyId format" });
    }

    let buyerId = null;
    let sellerId = null;

    if (req.user.role === "buyer") {
      buyerId = req.user.id;
      sellerId = counterpartyId;
    } else if (req.user.role === "seller") {
      sellerId = req.user.id;
      buyerId = counterpartyId;
    } else {
      return res.status(403).json({ error: "Only buyers and sellers can create deals" });
    }

    
    const validStatuses = ["Pending", "In Progress", "Completed", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid deal status" });
    }

    
    const deal = await Deal.create({
      title,
      description,
      price,
      buyer: buyerId,
      seller: sellerId,
      status: status || "Pending",
    });

    
    if (redisClient.isReady) {
      await redisClient.set(`deal:${deal._id}`, JSON.stringify(deal), { EX: 3600 });
    } else {
      console.warn("Redis is not connected. Skipping caching.");
    }

    res.status(201).json({ message: "Deal Created Successfully", deal });
  } catch (error) {
    console.error("Deal Creation Error:", error);
    res.status(500).json({ error: "Deal Creation Failed", details: error.message });
  }
};






