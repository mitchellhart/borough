const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

// Helper function to update user subscription
async function updateUserSubscription(userId) {
  try {
    console.log('Attempting to update subscription for userId:', userId);
    
    const result = await pool.query(
      `UPDATE users 
       SET subscription_status = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE auth_id = $2 
       RETURNING *`,
      ['active', userId]
    );

    if (result.rows.length > 0) {
      console.log('Successfully updated subscription:', result.rows[0]);
      return result.rows[0];
    } else {
      console.error('No user found with userId:', userId);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

module.exports = function(authenticateUser) {
  // Regular routes that need authentication
  router.post('/create-checkout-session', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.uid;
      const { couponId } = req.body; // Add this line to get coupon

      console.log('Creating checkout session for user:', {
        userId: userId,
        userEmail: req.user.email,
        env: {
          stripeKey: !!process.env.STRIPE_SECRET_KEY,
          priceId: !!process.env.STRIPE_PRICE_ID,
          clientUrl: process.env.CLIENT_URL
        }
      });

      // First, create or retrieve a customer
      let customer;
      try {
        const customerResult = await pool.query(
          'SELECT stripe_customer_id FROM users WHERE auth_id = $1',
          [userId]
        );
        console.log('Customer query result:', customerResult.rows);

        if (customerResult.rows[0]?.stripe_customer_id) {
          customer = customerResult.rows[0].stripe_customer_id;
          console.log('Found existing customer:', customer);
        } else {
          console.log('Creating new Stripe customer');
          const newCustomer = await stripe.customers.create({
            email: req.user.email,
            metadata: { userId: userId }
          });
          customer = newCustomer.id;
          console.log('Created new customer:', customer);
          
          // Save customer ID to database
          await pool.query(
            'UPDATE users SET stripe_customer_id = $1 WHERE auth_id = $2',
            [customer, userId]
          );
          console.log('Saved customer ID to database');
        }
      } catch (dbError) {
        console.error('Database error:', {
          message: dbError.message,
          stack: dbError.stack,
          code: dbError.code
        });
        throw dbError;
      }

      console.log('Creating Stripe checkout session with params:', {
        customer,
        priceId: process.env.STRIPE_PRICE_ID,
        returnUrl: `${process.env.CLIENT_URL}/return?session_id={CHECKOUT_SESSION_ID}`
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        discounts: couponId ? [{
          coupon: couponId,
        }] : undefined,
        ui_mode: 'embedded',
        customer: customer,
        return_url: `${process.env.CLIENT_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          userId: userId
        }
      });

      if (couponId) {
        session.discounts = [{
          coupon: couponId,
        }];
      }

      console.log('Checkout session created successfully:', {
        sessionId: session.id,
        clientSecret: !!session.client_secret
      });

      res.json({
        clientSecret: session.client_secret
      });
    } catch (error) {
      console.error('Error creating checkout session:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.type,
        raw: error.raw ? {
          message: error.raw.message,
          code: error.raw.code,
          type: error.raw.type
        } : undefined
      });
      
      res.status(500).json({ 
        error: 'Failed to create checkout session',
        details: error.message 
      });
    }
  });


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


  // Simplified cancel subscription endpoint
  router.post('/cancel-subscription', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.uid;
      console.log('Attempting to cancel subscription for userId:', userId);
      
      // Get subscription info from users table
      const result = await pool.query(
        `SELECT stripe_subscription_id, subscription_status 
         FROM users 
         WHERE auth_id = $1`,
        [userId]
      );

      console.log('Database query result:', {
        found: result.rows.length > 0,
        subscriptionId: result.rows[0]?.stripe_subscription_id,
        status: result.rows[0]?.subscription_status
      });

      if (!result.rows[0]?.stripe_subscription_id || result.rows[0].subscription_status !== 'active') {
        console.log('Subscription check failed:', {
          hasSubscriptionId: !!result.rows[0]?.stripe_subscription_id,
          status: result.rows[0]?.subscription_status
        });
        throw new Error('No active subscription found');
      }

      console.log('Found active subscription, canceling in Stripe:', result.rows[0].stripe_subscription_id);

      // Cancel in Stripe
      await stripe.subscriptions.cancel(result.rows[0].stripe_subscription_id);

      // Update user record
      const updateResult = await pool.query(
        `UPDATE users 
         SET subscription_status = 'canceled',
             updated_at = CURRENT_TIMESTAMP 
         WHERE auth_id = $1 
         RETURNING subscription_status`,
        [userId]
      );

      console.log('Updated user subscription status:', updateResult.rows[0]);

      res.json({ message: 'Subscription successfully canceled' });
    } catch (error) {
      console.error('Detailed cancel error:', {
        message: error.message,
        userId: req.user.uid,
        stack: error.stack
      });
      res.status(500).json({ 
        error: 'Failed to cancel subscription', 
        details: error.message 
      });
    }
  });

  // New endpoint for one-time payments
  router.post('/create-one-time-checkout', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.uid;
      const { couponId } = req.body;

      console.log('Creating one-time checkout session for user:', {
        userId: userId,
        userEmail: req.user.email
      });

      // First, create or retrieve a customer
      let customer;
      try {
        const customerResult = await pool.query(
          'SELECT stripe_customer_id FROM users WHERE auth_id = $1',
          [userId]
        );

        if (customerResult.rows[0]?.stripe_customer_id) {
          customer = customerResult.rows[0].stripe_customer_id;
        } else {
          const newCustomer = await stripe.customers.create({
            email: req.user.email,
            metadata: { userId: userId }
          });
          customer = newCustomer.id;
          
          await pool.query(
            'UPDATE users SET stripe_customer_id = $1 WHERE auth_id = $2',
            [customer, userId]
          );
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      // Create one-time payment session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_ONE_TIME_PRICE_ID, // You'll need to add this to your .env
            quantity: 1,
          },
        ],
        mode: 'payment', // Changed to 'payment' instead of 'subscription'
        allow_promotion_codes: true,
        discounts: couponId ? [{
          coupon: couponId,
        }] : undefined,
        ui_mode: 'embedded',
        customer: customer,
        return_url: `${process.env.CLIENT_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          userId: userId,
          planType: 'one-time'
        }
      });

      console.log('One-time checkout session created successfully:', {
        sessionId: session.id,
        clientSecret: !!session.client_secret
      });

      res.json({
        clientSecret: session.client_secret
      });
    } catch (error) {
      console.error('Error creating one-time checkout session:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json({ 
        error: 'Failed to create one-time checkout session',
        details: error.message 
      });
    }
  });

  return router;
}; 