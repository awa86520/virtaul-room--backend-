const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { dealId, amount, currency, paymentMethodType } = req.body;
    const buyerId = req.user.id;

    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    
    const validPaymentMethods = ["card", "upi"];
    if (!validPaymentMethods.includes(paymentMethodType)) {
      return res.status(400).json({ error: "Invalid payment method type" });
    }

    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency,
      payment_method_types: [paymentMethodType], 
      metadata: { dealId, buyerId },
    });

  
    const payment = await Payment.create({
      dealId,
      buyerId,
      amount,
      currency,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
      paymentMethodType,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });

  } catch (error) {
    console.error(" Payment Error:", error);

  
    if (error.type === "StripeCardError") {
      return res.status(400).json({ error: error.message }); 
    } else if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({ error: "Invalid request to Stripe" });
    } else {
      return res.status(500).json({ error: "Payment processing failed. Try again." });
    }
  }
};


