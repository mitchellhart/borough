const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../middleware/auth');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // You'll need this in your env variables
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cancel`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 