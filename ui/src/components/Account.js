import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Set user data
        setUser({
          email: currentUser.email,
          createdAt: new Date(currentUser.metadata.creationTime).toLocaleDateString(),
          lastSignIn: new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
        });

        // Fetch subscription status
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch('/api/subscription-status', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setSubscriptionStatus(data);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      } else {
        setUser(null);
        setSubscriptionStatus(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

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
            <p className="mt-1 text-gray-900">
              {subscriptionStatus?.status === 'active' ? (
                <span className="text-green-600 font-medium">Active</span>
              ) : (
                <span className="text-red-600 font-medium">No active subscription</span>
              )}
            </p>
          </div>
          {subscriptionStatus?.currentPeriodEnd && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Renews On</label>
              <p className="mt-1 text-gray-900">
                {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
          {subscriptionStatus?.status !== 'active' && (
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Subscribe Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account; 