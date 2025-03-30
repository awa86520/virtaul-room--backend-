const express = require("express");
const { joinRoom, sendMessage, getMessages } = require("../controllers/chatController");
//const authMiddleware = require("../middleware/authMiddleware");
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/join", authMiddleware, joinRoom);
router.post("/send", authMiddleware, sendMessage);
router.get("/:dealId", authMiddleware, getMessages);

module.exports = router;
