const User = require("../models/user");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email role");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { getAllUsers };
