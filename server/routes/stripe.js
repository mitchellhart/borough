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

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        ui_mode: 'embedded',
        return_url: `${process.env.CLIENT_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          userId: userId
        }
      });

      res.json({
        clientSecret: session.client_secret
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
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

  // Webhook route - needs raw body
  router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log('Successfully constructed event:', event.type);

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log('Checkout Session Data:', {
            id: session.id,
            metadata: session.metadata,
            subscription: session.subscription
          });
          
          const userId = session.metadata?.userId;
          if (userId) {
            // Update both subscription status and stripe_subscription_id
            const result = await pool.query(
              `UPDATE users 
               SET subscription_status = $1,
                   stripe_subscription_id = $2,
                   updated_at = CURRENT_TIMESTAMP 
               WHERE auth_id = $3 
               RETURNING *`,
              ['active', session.subscription, userId]
            );

            console.log('Updated user subscription:', result.rows[0]);
          } else {
            console.log('No userId found in session metadata:', session);
          }
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          console.log('Subscription Data:', {
            id: subscription.id,
            metadata: subscription.metadata
          });
          
          const subUserId = subscription.metadata?.userId;
          if (subUserId) {
            await updateUserSubscription(subUserId);
          } else {
            console.log('No userId found in subscription metadata:', subscription);
          }
          break;
          
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
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

  return router;
}; 