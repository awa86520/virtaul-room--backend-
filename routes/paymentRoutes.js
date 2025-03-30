const express = require("express");
const { createPaymentIntent } = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Route to create a payment intent (Requires authentication)
router.post("/create-intent", authMiddleware, createPaymentIntent);

module.exports = router;
