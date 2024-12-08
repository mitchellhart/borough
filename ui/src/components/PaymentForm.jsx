import React, { useCallback, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth } from 'firebase/auth';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import BoroughLogo from '../assets/Borough-logo.svg';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ onClose }) {
  useEffect(() => {
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchClientSecret = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      const headers = {
        'Content-Type': 'application/json'
      };

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
    <div className="fixed inset-0 flex">
      {/* Left Panel - Product Info */}
      <div className="w-1/2 bg-[#85E5B5] p-12 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <img src={BoroughLogo} alt="Borough" className="h-24 mb-8" />
          <h1 className="text-4xl font-nohemi text-gray-800 mb-6">
            Analyze Your Home Inspection Report
          </h1>
          <div className="space-y-6 text-lg text-gray-700 max-w-md">
            <p>✓ Instant AI Analysis</p>
            <p>✓ Detailed Cost Estimates</p>
            <p>✓ Priority Rankings</p>
            <p>✓ Interactive Report Dashboard</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Right Panel - Checkout Form */}
      <div className="w-1/2 bg-white overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800">Subscribe to Borough</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 h-full">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout 
                className="h-full"
                onLoadError={(error) => console.error('Checkout load error:', error)}
              />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm; 