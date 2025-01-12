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

// Raw body parser specifically for this route
router.post('/', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Full checkout session data:', {
        customer: session.customer,
        subscription: session.subscription,
        clientReferenceId: session.client_reference_id,
        mode: session.mode
      });

      // Update user record with both subscription and customer IDs
      await pool.query(
        `UPDATE users 
         SET stripe_customer_id = $1,
             stripe_subscription_id = $2,
             subscription_status = 'active',
             updated_at = CURRENT_TIMESTAMP
         WHERE auth_id = $3
         RETURNING *`,
        [
          session.customer,
          session.subscription,
          session.client_reference_id // Make sure you're passing this from the frontend
        ]
      );

      console.log('Updated user record with subscription details:', {
        customerId: session.customer,
        subscriptionId: session.subscription,
        userId: session.client_reference_id
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router; 