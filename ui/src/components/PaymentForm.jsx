import React, { useCallback, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth } from 'firebase/auth';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import BoroughLogo from '../assets/Borough-logo.svg';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ onClose }) {
  const [stripeBlocked, setStripeBlocked] = useState(false);

  useEffect(() => {
    // Verify Stripe key is available
    if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
      console.error('Missing Stripe publishable key in environment');
    }
    
    // Log the API URL being used (but not the key itself)
    console.log('API URL:', process.env.REACT_APP_API_URL || 'Not set');
  }, []);

  useEffect(() => {
    // Prevent scrolling on mount with passive event listeners
    const preventDefault = (e) => {
      e.preventDefault();
    };

    // Add passive event listeners where possible
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('wheel', preventDefault, { passive: false });

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('wheel', preventDefault);
    };
  }, []);

  useEffect(() => {
    // Check if Stripe is blocked
    const testStripeConnection = async () => {
      try {
        // Test multiple Stripe endpoints
        const endpoints = [
          'https://js.stripe.com/v3/',
          'https://api.stripe.com/v1/payment_pages'
        ];

        const results = await Promise.all(
          endpoints.map(url => 
            fetch(url)
              .then(response => response.ok)
              .catch(() => false)
          )
        );

        if (results.some(result => !result)) {
          setStripeBlocked(true);
          console.warn('Some Stripe endpoints are blocked. Payment functionality may be limited.');
        }
      } catch (error) {
        console.error('Stripe connection test error:', error);
        setStripeBlocked(true);
      }
    };
    
    testStripeConnection();
  }, []);

  const fetchClientSecret = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      const headers = {
        'Content-Type': 'application/json'
      };

      // Only add auth header if user is logged in
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/create-checkout-session`,
        {
          method: "POST",
          headers,
          credentials: 'include',
        }
      );

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
      {stripeBlocked && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-100 p-3 text-center text-yellow-800">
          <p>
            Please disable your ad blocker or privacy extensions to complete your purchase. 
            <br />
            <span className="text-sm">
              We use Stripe for secure payment processing, but some security extensions may block it.
            </span>
          </p>
        </div>
      )}
      
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