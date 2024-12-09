import React, { useCallback, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import BoroughLogo from '../assets/Borough-logo.svg';
import Auth from './Auth';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function PaymentForm() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setShowCheckout(true);
    } else {
      setShowAuth(true);
    }
  }, []);

  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuth().currentUser.getIdToken()}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('fetchClientSecret error:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('wheel', preventDefault, { passive: false });

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('wheel', preventDefault);
    };
  }, []);

  const handleAuthSuccess = () => {
    console.log('Auth success, showing checkout');
    setShowAuth(false);
    setShowCheckout(true);
  };

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
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-white overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800">
            {showCheckout ? 'Subscribe to Borough' : 'Create Your Account'}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {showAuth && (
            <Auth 
              initialMode="signup"
              onClose={() => navigate(-1)}
              onAuthSuccess={handleAuthSuccess}
            />
          )}
          {showCheckout && (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentForm; 