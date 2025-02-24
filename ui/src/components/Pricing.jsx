import React from 'react';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';

function Pricing() {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handlePlanSelect = (planType) => {
    localStorage.setItem('selectedPlan', planType);
    navigate('/payment', { 
      state: { 
        planType,
        price: planType === 'subscription' ? 35 : 20
      } 
    });
  };

  return (
    <div 
      className="p-8 bg-[#E6E2DD] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#395E44] mb-12">
          Choose Your Plan
        </h1>
        
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Subscription Plan */}
          <motion.div 
            className="bg-white p-8 rounded-3xl shadow-lg"
            variants={item}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#395E44] mb-2">Monthly Subscription</h2>
              <div className="text-4xl font-bold text-[#395E44]">
                $35<span className="text-lg font-normal">/month</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-[#395E44]">
                    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
                  </svg>
                </div>
                Unlimited Report Analysis
              </li>
              <li className="flex items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-[#395E44]">
                    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
                  </svg>
                </div>
                Priority Support
              </li>
              <li className="flex items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-[#395E44]">
                    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
                  </svg>
                </div>
                Cancel Anytime
              </li>
            </ul>
            
            <button
              onClick={() => handlePlanSelect('subscription')}
              className="w-full bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors"
            >
              Subscribe Now
            </button>
          </motion.div>

          {/* Single Report Plan */}
          <motion.div 
            className="bg-white p-8 rounded-3xl shadow-lg"
            variants={item}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#395E44] mb-2">Single Report</h2>
              <div className="text-4xl font-bold text-[#395E44]">
                $20<span className="text-lg font-normal">/report</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-[#395E44]">
                    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
                  </svg>
                </div>
                One Complete Report Analysis
              </li>
              <li className="flex items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-[#395E44]">
                    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
                  </svg>
                </div>
                Standard Support
              </li>
              <li className="flex items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-[#395E44]">
                    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
                  </svg>
                </div>
                No Commitment
              </li>
            </ul>
            
            <button
              onClick={() => handlePlanSelect('one-time')}
              className="w-full border-2 border-[#395E44] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-[#395E44] hover:text-white transition-colors"
            >
              Buy Single Report
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Pricing; 