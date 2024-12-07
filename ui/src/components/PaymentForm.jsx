import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth } from 'firebase/auth';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ onClose }) {
  const fetchClientSecret = useCallback(async () => {
    try {
      // Get the current user's token if they're logged in
      const auth = getAuth();
      const user = auth.currentUser;
      
      const headers = {
        'Content-Type': 'application/json'
      };

      // Only add authorization if user is logged in
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout session error:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('Checkout session response:', data);

      if (!data.clientSecret) {
        throw new Error('No client secret received');
      }

      return data.clientSecret;
    } catch (error) {
      console.error('fetchClientSecret error:', error);
      throw error;
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800">Complete Your Purchase</h2>
        </div>
        
        {/* Checkout Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout 
              className="min-h-[500px]"
              onLoadError={(error) => console.error('Checkout load error:', error)}
            />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm; 