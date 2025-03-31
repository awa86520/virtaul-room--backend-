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

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Prepare user data (excluding password for security)
    const userData = {
      _id: user._id,
      name: user.username, // Ensure this field exists in your User model
      email: user.email,
      role: user.role,
    };

    // Store user session in Redis (if Redis is available)
    if (redisClient && redisClient.isReady) {
      try {
        await redisClient.set(`user:${user._id}`, JSON.stringify(userData), {
          EX: 3600,
        });
      } catch (redisError) {
        console.error("Redis storage error:", redisError);
      }
    } else {
      console.warn("Redis client is not connected. Skipping caching.");
    }

    // Send response
    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};