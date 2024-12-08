const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get('/session-status', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    res.json({
      status: session.status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    console.error('Stripe session status error:', error);
    res.status(500).json({ error: 'Failed to get session status' });
  }
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('Creating checkout session');
    
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_collection: 'always',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      discounts: [],
      return_url: `${FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true }
    });

    console.log('Session created successfully');
    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Stripe error:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    res.status(500).json({ error: error.message });
  }
});

router.get('/validate-promotion-code', async (req, res) => {
  try {
    const { code } = req.query;
    const promotionCode = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1
    });

    res.json({ valid: promotionCode.data.length > 0 });
  } catch (error) {
    console.error('Promotion code validation error:', error);
    res.status(400).json({ error: 'Invalid promotion code' });
  }
});

module.exports = router; 