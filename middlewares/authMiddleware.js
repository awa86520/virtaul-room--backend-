const jwt = require("jsonwebtoken");
require("dotenv").config();
const redisClient = require("../config/redis");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    let cachedUser = null;
    if (redisClient && typeof redisClient.get === "function") {
      cachedUser = await redisClient.get(`user:${userId}`);
    }

    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      return next();
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    
    if (redisClient && typeof redisClient.set === "function") {
      await redisClient.set(`user:${userId}`, JSON.stringify(user), "EX", 3600);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).json({ msg: "Invalid token" });
  }
};

