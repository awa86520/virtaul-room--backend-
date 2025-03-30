const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");


exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

  
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    user = new User({ username, email, password: hashedPassword, role });
    await user.save();

  
    const userData = { _id: user._id, username, email, role };

    if (redisClient && typeof redisClient.set === "function") {
      await redisClient.set(`user:${user._id}`, JSON.stringify(userData), "EX", 3600);
    } else {
      console.error(" Redis client not initialized correctly.");
    }

    
    res.status(201).json({
      msg: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  
    const userData = {
      _id: user._id,
      name: user.username,  
      email: user.email,
      role: user.role
    };

    
    if (redisClient && typeof redisClient.set === "function") {
      await redisClient.set(`user:${user._id}`, JSON.stringify(userData), "EX", 3600);
    } else {
      console.error(" Redis client not initialized correctly.");
    }

    
    res.json({ token, user: userData });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
