import React from 'react';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import BoroLogo from '../assets/boro-logo.svg';

function About() {
  return (
    <div 
      className="p-8 bg-[#E6E2DD] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-nohemi text-[#395E44] mb-12">About Boro</h1>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Boro (short for Borough) is an platform designed to help first time home buyers navigate the complex process of buying a home, begining with demystifying and simplifying property inspection reports.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-nohemi text-[#395E44]">Our Mission</h2>
            <p className="text-lg text-gray-600">
              We're committed to being your trusted guide through the complex journey of first-time home buying. 
              We understand that the process can be overwhelming, confusing, and often leaves you relying solely on friends and family for advice. 
              Boro aims to be your dependable partner, making property inspection reports clear and actionable, 
              so you can make confident decisions about your future home.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-nohemi text-[#395E44]">How It Works</h2>
            <p className="text-lg text-gray-600">
              Using advanced technology, Boro analyzes property inspection reports to extract key insights, identify potential issues, and provide clear, actionable summaries and estimates.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-nohemi text-[#395E44]">Contact Us</h2>
            <p className="text-lg text-gray-600">
              Have questions or feedback? Reach out to us at{' '}
              <a href="mailto:contact@boroinspect.com" className="text-[#395E44] hover:text-[#FFB252]">
                contact@boroinspect.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 