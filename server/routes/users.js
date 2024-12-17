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
    console.log('[users.js] Fetching status for userId:', userId);
    
    const result = await pool.query(
      `SELECT subscription_status, updated_at, credits 
       FROM users 
       WHERE auth_id = $1`,
      [userId]
    );

    if (result.rows.length > 0) {
      const status = {
        status: result.rows[0].subscription_status,
        lastUpdated: result.rows[0].updated_at,
        credits: result.rows[0].credits
      };
      console.log('Returning subscription status:', status);
      return status;
    } else {
      console.log('No user found with userId:', userId);
      return { status: 'inactive', credits: 0 };
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

async function canAnalyzeReport(userId) {
  try {
    console.log('Checking analysis access for userId:', userId);
    
    const result = await pool.query(
      `SELECT subscription_status, credits 
       FROM users 
       WHERE auth_id = $1`,
      [userId]
    );

    console.log('Access check result:', {
      rowCount: result.rows.length,
      userData: result.rows[0]
    });

    if (!result.rows[0]) {
      return { canAnalyze: false, reason: 'User not found' };
    }

    const user = result.rows[0];

    if (user.subscription_status === 'active') {
      return { canAnalyze: true, reason: 'Active subscription' };
    }

    if (user.credits > 0) {
      return { canAnalyze: true, reason: 'Has credits' };
    }

    return { 
      canAnalyze: false, 
      reason: 'No active subscription or credits available' 
    };
  } catch (error) {
    console.error('Error checking user access:', error);
    throw error;
  }
}

async function deductCredit(userId) {
  try {
    console.log('Attempting to deduct credit for userId:', userId);
    
    const result = await pool.query(
      `UPDATE users 
       SET credits = credits - 1,
           updated_at = CURRENT_TIMESTAMP 
       WHERE auth_id = $1 
         AND credits > 0 
       RETURNING credits`,
      [userId]
    );

    console.log('Credit deduction result:', {
      rowCount: result.rows.length,
      remainingCredits: result.rows[0]?.credits
    });

    if (!result.rows[0]) {
      throw new Error('No credits available to deduct');
    }

    return result.rows[0].credits;
  } catch (error) {
    console.error('Error deducting credit:', error);
    throw error;
  }
}

module.exports = {
  updateUserSubscription,
  getUserSubscriptionStatus,
  canAnalyzeReport,
  deductCredit,
  pool
};