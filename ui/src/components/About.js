import React from 'react';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import BoroughLogo from '../assets/Borough-logo.svg';

function About() {
  return (
    <motion.div 
      className="p-8 bg-[#E6E2DD] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/" className="block mb-8 ml-4">
        <img 
          src={BoroughLogo}
          alt="Borough Logo" 
          className="h-8 w-auto"
        />
      </Link>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-[#395E44] mb-8">About Borough</h1>
        
        <div className="space-y-6 text-[#395E44]">
          <p className="text-lg">
            Borough is an platform designed to help first time home buyers navigate the complex process of buying a home, begining with demystifying and simplifying property inspection reports.
          </p>

          <h2 className="text-2xl font-semibold mt-8">Our Mission</h2>
          <p className="text-lg">
            We're committed to being your trusted guide through the complex journey of first-time home buying. 
            We understand that the process can be overwhelming, confusing, and often leaves you relying solely on friends and family for advice. 
            Borough aims to be your dependable partner, making property inspection reports clear and actionable, 
            so you can make confident decisions about your future home.
          </p>

          <h2 className="text-2xl font-semibold mt-8">How It Works</h2>
          <p className="text-lg">
            Using advanced technology, Borough analyzes property inspection reports to extract key insights, identify potential issues, and provide clear, actionable summaries and estimates.
          </p>

          <h2 className="text-2xl font-semibold mt-8">Contact Us</h2>
          <p className="text-lg">
            Have questions or feedback? Reach out to us at{' '}
            <a href="mailto:contact@borough-ai.com" className="text-[#6D8671] hover:underline">
              contact@borough-ai.com
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default About; 