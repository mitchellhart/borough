const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

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

async function getUserSubscriptionStatus(userId) {
  try {
    console.log('Fetching subscription status for userId:', userId);
    
    const result = await pool.query(
      `SELECT subscription_status, updated_at 
       FROM users 
       WHERE auth_id = $1`,
      [userId]
    );

    console.log('Database query result:', {
      rowCount: result.rows.length,
      firstRow: result.rows[0],
      queriedUserId: userId
    });

    if (result.rows.length > 0) {
      const status = {
        status: result.rows[0].subscription_status,
        lastUpdated: result.rows[0].updated_at
      };
      console.log('Returning subscription status:', status);
      return status;
    } else {
      console.log('No user found with userId:', userId);
      return { status: 'inactive' };
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

module.exports = {
  updateUserSubscription,
  getUserSubscriptionStatus,
  pool
};