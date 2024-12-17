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
        console.log('1. Webhook: Checkout Session Data:', {
          mode: session.mode,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
          status: session.status
        });
        
        const userId = session.metadata?.userId;
        console.log('1.5. UserId from metadata:', userId);
        
        if (userId) {
          try {
            console.log('1.7. Payment mode and status:', {
              mode: session.mode,
              paymentStatus: session.payment_status
            });
            
            if (session.mode === 'payment' && session.payment_status === 'paid') {
              console.log('2. Processing one-time payment for userId:', userId);
              // Add one credit for one-time payment
              const result = await pool.query(
                `UPDATE users 
                 SET credits = credits + 1,
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE auth_id = $1 
                 RETURNING credits`,
                [userId]
              );
              console.log('3. Credit update result:', {
                success: !!result.rows[0],
                newCredits: result.rows[0]?.credits
              });
            } else if (session.mode === 'subscription') {
              console.log('4. Processing subscription payment');
              await updateUserSubscription(userId);
            }
          } catch (error) {
            console.error('5. Error processing payment:', {
              error: error.message,
              userId,
              sessionId: session.id
            });
          }
        }
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('Subscription Data:', {
          id: subscription.id,
          metadata: subscription.metadata
        });
        
        // Get userId from metadata
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

module.exports = router; 