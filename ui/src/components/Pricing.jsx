import React from 'react';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import BoroLogo from '../assets/Boro-logo.svg';

function Pricing() {
  const navigate = useNavigate();

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
    <motion.div 
      className="p-8 bg-[#E6E2DD] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/" className="block mb-8 ml-4">
        <img 
          src={BoroLogo}
          alt="Boro Logo" 
          className="h-8 w-auto"
        />
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#395E44] mb-12">
          Choose Your Plan
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Subscription Plan */}
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#395E44] mb-2">Monthly Subscription</h2>
              <div className="text-4xl font-bold text-[#395E44]">
                $35<span className="text-lg font-normal">/month</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center mr-3">
                  <span className="text-white">✓</span>
                </div>
                Unlimited Report Analysis
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center mr-3">
                  <span className="text-white">✓</span>
                </div>
                Priority Support
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center mr-3">
                  <span className="text-white">✓</span>
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
          </div>

          {/* Single Report Plan */}
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#395E44] mb-2">Single Report</h2>
              <div className="text-4xl font-bold text-[#395E44]">
                $20<span className="text-lg font-normal">/report</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center mr-3">
                  <span className="text-white">✓</span>
                </div>
                One Complete Report Analysis
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center mr-3">
                  <span className="text-white">✓</span>
                </div>
                Standard Support
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center mr-3">
                  <span className="text-white">✓</span>
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Pricing; 