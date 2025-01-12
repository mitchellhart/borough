import React, { useCallback, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getAuth } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import BoroughLogo from '../assets/Borough-logo.svg';
import Auth from './Auth';
import { getAnalytics, logEvent } from "firebase/analytics";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

stripePromise.catch(error => {
  console.error('Stripe initialization error:', error);
});

function PaymentForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Get the plan type from router state or localStorage
  const [planType, setPlanType] = useState(location.state?.planType || localStorage.getItem('selectedPlan') || null);
  const [clientSecret, setClientSecret] = useState(null);
  const [couponCode, setCouponCode] = useState('');

  const price = planType === 'subscription' ? 35 : 20;

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setShowCheckout(true);
    } else {
      setShowAuth(true);
    }
    return () => localStorage.removeItem('selectedPlan');

  }, []);


  const fetchClientSecret = useCallback(async () => {
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();
      const userId = auth.currentUser.uid;
      
      console.log('Creating checkout session for user:', userId); // Debug log
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          planType,
          userId,  // Make sure we're sending the userId
          couponCode
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout session error:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Client secret fetched successfully');
      return data.clientSecret;
    } catch (error) {
      console.error('fetchClientSecret error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert('Unable to initialize payment form. Please try again later.');
      throw error;
    }
  }, [planType, couponCode]);

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
    console.log('Auth success, showing payment selection');
    setShowAuth(false);
  };

  const handlePlanTypeSelect = (type) => {
    setPlanType(type);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (result) => {
    const analytics = getAnalytics();
    logEvent(analytics, 'purchase', {
      currency: 'USD',
      value: planType === 'subscription' ? 35 : 20,
      items: [{
        name: planType === 'subscription' ? 'Monthly Subscription' : 'Single Report',
        price: planType === 'subscription' ? 35 : 20
      }]
    });
    
    // ... rest of your success handling
  };

  const handlePaymentError = (error) => {
    const analytics = getAnalytics();
    logEvent(analytics, 'payment_error', {
      error_message: error.message,
      plan_type: planType
    });
    
    // ... rest of your error handling
  };

  return (
    <div className="fixed inset-0 flex">
      {/* Left Panel - Product Info */}
      <div className="w-1/2 p-12 flex flex-col" style={{ backgroundColor: '#E6E2DD' }}>
        <div className="flex-1 flex flex-col justify-center">
          <img src={BoroughLogo} alt="Borough" className="w-24 mb-6" />
          <h1 className="text-[#395E44] text-4xl sm:text-5xl lg:text-6xl font-nohemi leading-tight mb-8">
            Instant Estimate from Your Inspection Report
          </h1>

          {/* Feature list styled like landing page */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="size-10 stroke-[#395E44] p-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Instant Estimate</span>
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="size-10 stroke-[#395E44] p-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Detailed Cost Breakdown</span>
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="size-10 stroke-[#395E44] p-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Negotiation Guide</span>
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="size-10 stroke-[#395E44] p-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Agents never change your report</span>
            </div>
          </div>
        </div>

        {/* Close button updated with new colors */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-[#395E44] hover:text-[#2a4332]"
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
            {showCheckout ? 'Checkout' :
              !showAuth ? 'Choose Your Plan' : 'Create Your Account'}
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

          {!showAuth && !showCheckout && (
            <div className="p-8 space-y-6">
              <div
                onClick={() => handlePlanTypeSelect('subscription')}
                className="p-6 border rounded-lg cursor-pointer hover:border-[#395E44] transition-colors"
              >
                <h3 className="text-xl font-semibold mb-2">Monthly Subscription</h3>
                <p className="text-gray-600">$35/month</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <span className="text-[#395E44] mr-2">✔</span>
                    Up to 20 report analysis each month
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#395E44] mr-2">✔</span>
                    Cancel anytime
                  </li>
                </ul>
              </div>

              <div
                onClick={() => handlePlanTypeSelect('one-time')}
                className="p-6 border rounded-lg cursor-pointer hover:border-[#395E44] transition-colors"
              >
                <h3 className="text-xl font-semibold mb-2">One-Time Payment</h3>
                <p className="text-gray-600">$20.00 per report</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <span className="text-[#395E44] mr-2">✔</span>
                    Single report analysis
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#395E44] mr-2">✔</span>
                    No recurring charges
                  </li>
                </ul>
              </div>
            </div>
          )}

          {showCheckout && (
            <div className="p-8 h-full">
              {planType === 'subscription' ? (
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ fetchClientSecret }}
                >
                  <EmbeddedCheckout
                    className="h-full"
                    onComplete={handlePaymentSuccess}
                    onLoadError={(error) => {
                      console.error('Checkout load error:', error);
                      alert('Unable to load payment form. Please try again later.');
                    }}
                  />
                </EmbeddedCheckoutProvider>
              ) : (
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{
                    fetchClientSecret
                  }}
                >
                  <EmbeddedCheckout
                    className="h-full"
                    onComplete={handlePaymentSuccess}
                    onLoadError={(error) => {
                      console.error('One-time checkout load error:', error);
                      alert('Unable to load payment form. Please try again later.');
                    }}
                  />
                </EmbeddedCheckoutProvider>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentForm; 