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

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

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
      const idToken = await getAuth().currentUser.getIdToken();
      console.log('Making request to:', `${process.env.REACT_APP_API_URL}/api/create-checkout-session`);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          couponId: couponCode,
          paymentType: planType
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
  }, [couponCode, planType]);

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

  return (
    <div className="fixed inset-0 flex">
      {/* Left Panel - Product Info */}
      <div className="w-1/2 p-12 flex flex-col" style={{ backgroundColor: '#E6E2DD' }}>
        <div className="flex-1 flex flex-col justify-center">
          <img src={BoroughLogo} alt="Borough" className="w-24 mb-6" />
          <h1 className="text-[#395E44] text-4xl sm:text-5xl lg:text-6xl font-nohemi leading-tight mb-8">
            Analyze Your Home Inspection Report
          </h1>

          {/* Feature list styled like landing page */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-lg">
              <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span>Instant AI Analysis</span>
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span>Detailed Cost Estimates</span>
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span>Priority Rankings</span>
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span>Interactive Report Dashboard</span>
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
                    onComplete={() => console.log('Checkout completed successfully')}
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
                    fetchClientSecret: async () => {
                      // Different endpoint or parameters for one-time payment
                      try {
                        const idToken = await getAuth().currentUser.getIdToken();
                        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create-one-time-checkout`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`
                          },
                          body: JSON.stringify({ 
                            couponId: couponCode,
                            planType: planType
                          }),
                          credentials: 'include'
                        });

                        if (!response.ok) {
                          const errorText = await response.text();
                          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }

                        const data = await response.json();
                        return data.clientSecret;
                      } catch (error) {
                        console.error('One-time checkout error:', error);
                        alert('Unable to initialize payment form. Please try again later.');
                        throw error;
                      }
                    }
                  }}
                >
                  <EmbeddedCheckout
                    className="h-full"
                    onComplete={() => console.log('One-time payment completed successfully')}
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