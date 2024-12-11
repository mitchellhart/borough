import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [cancelStatus, setCancelStatus] = useState({ loading: false, error: null });
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email,
          createdAt: new Date(currentUser.metadata.creationTime).toLocaleDateString(),
          lastSignIn: new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
        });

        try {
          const token = await currentUser.getIdToken();
          const apiUrl = process.env.REACT_APP_API_URL || '';
          const response = await fetch(`${apiUrl}/api/subscription-status`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Subscription data:', data);
          setSubscriptionStatus(data);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setSubscriptionStatus({ status: 'error', message: error.message });
        }
      } else {
        setUser(null);
        setSubscriptionStatus(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setCancelStatus({ loading: true, error: null });
    try {
      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.REACT_APP_API_URL || '';
      
      const response = await fetch(`${apiUrl}/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Refresh subscription status
      setSubscriptionStatus({ status: 'canceled' });
      alert('Your subscription has been successfully canceled');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setCancelStatus({ loading: false, error: 'Failed to cancel subscription' });
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active':
        return {
          text: 'Active',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '✓'
        };
      case 'canceled':
        return {
          text: 'Canceled',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '!'
        };
      case 'inactive':
        return {
          text: 'Inactive',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '✕'
        };
      default:
        return {
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '?'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-800">Please sign in to view your account</h2>
      </div>
    );
  }

  return (
    <div className="rounded-b-3xl sm:p-8" style={{ backgroundColor: '#E6E2DD' }}>
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Account Created</label>
            <p className="mt-1 text-gray-900">{user.createdAt}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Last Sign In</label>
            <p className="mt-1 text-gray-900">{user.lastSignIn}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Subscription</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Status</label>
            <div className="mt-1">
              {subscriptionStatus?.status === 'active' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Inactive
                </span>
              )}
            </div>
          </div>

          {subscriptionStatus?.lastUpdated && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Last Updated</label>
              <p className="mt-1 text-gray-900">
                {new Date(subscriptionStatus.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          )}

          {subscriptionStatus?.status !== 'active' && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/subscribe')}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          )}

          {subscriptionStatus?.status === 'active' && (
            <div className="mt-6">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelStatus.loading}
                className={`text-red-600 border border-red-600 px-6 py-2 rounded-full 
                  hover:bg-red-50 transition-colors ${cancelStatus.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {cancelStatus.loading ? 'Canceling...' : 'Cancel Subscription'}
              </button>
              {cancelStatus.error && (
                <p className="mt-2 text-red-600 text-sm">{cancelStatus.error}</p>
              )}
            </div>
          )}

          {subscriptionStatus?.status === 'canceled' && (
            <p className="text-gray-600">
              Your subscription has been canceled. You'll continue to have access until the end of your billing period.
            </p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default Account; 