const Message = require("../models/Message");
const { io } = require("../app");
const User = require("../models/user");

exports.joinRoom = async (req, res) => {
    try {
      const { dealId } = req.body;
      const userId = req.user.id;
  
      
      if (!global.io) {
        console.error("Socket.io is not initialized");
        return res.status(500).json({ msg: "Socket.io is not initialized" });
      }
  
      
      setImmediate(() => {
        global.io.to(dealId).emit("userJoined", { userId, message: "User joined the room" });
      });
  
      res.json({ message: `Joined virtual room for deal: ${dealId}` });
    } catch (err) {
      console.error("Join Room Error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  };

 

  
  exports.sendMessage = async (req, res) => {
    try {
      const { dealId, content } = req.body;
      const senderId = req.user.id;
  
      
      if (!global.io) {
        console.error("Socket.io is not initialized");
        return res.status(500).json({ msg: "Socket.io is not initialized" });
      }
  
      
      const sender = await User.findById(senderId).select("username ");
      if (!sender) {
        return res.status(404).json({ msg: "Sender not found" });
      }
  
      
      const message = await Message.create({ dealId, sender: senderId, content });
  
      
      const responseMessage = {
        _id: message._id,
        dealId: message.dealId,
        sender: {
          id: senderId,
          username : sender.username,
        },
        content: message.content,
        createdAt: message.createdAt,
      };
  
      
      setImmediate(() => {
        global.io.to(dealId).emit("receiveMessage", responseMessage);
      });
  
      res.status(201).json(responseMessage);
    } catch (err) {
      console.error("Send Message Error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  };
  
  

exports.getMessages = async (req, res) => {
  try {
    const { dealId } = req.params;

    const messages = await Message.find({ dealId }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

