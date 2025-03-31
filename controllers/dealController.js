const mongoose = require("mongoose");
const Deal = require("../models/Deal");
const redisClient = require("../config/redis");

exports.createDeal = async (req, res) => {
  try {
    const { title, description, price, status } = req.body;

    
    if (!title || !description || !price) {
      return res.status(400).json({ error: "Title, description, and price are required" });
    }

    
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    
    if (!["buyer", "seller"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only buyers and sellers can create deals" });
    }

    
    const deal = new Deal({
      title,
      description,
      price,
      status: status || "Pending",
      createdBy: req.user.id,
    });

    await deal.save();

    
    if (redisClient.isReady) {
      await redisClient.set(`deal:${deal._id}`, JSON.stringify(deal), { EX: 3600 });
    }

    res.status(201).json({ message: "Deal Created Successfully", deal });
  } catch (error) {
    console.error("Deal Creation Error:", error);
    res.status(500).json({ error: "Deal Creation Failed", details: error.message });
  }
};
exports.getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find({}, "title description price");
    res.status(200).json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({ error: "Failed to fetch deals" });
  }
};







