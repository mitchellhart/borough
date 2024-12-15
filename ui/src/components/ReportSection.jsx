import React from 'react';
import { motion } from "motion/react"
import { ReactComponent as HammerIcon } from '../assets/hammer-ico.svg';
import Hammer from '../assets/hammer-solid.svg';
import HammerOutline from '../assets/hammer-outline.svg';
import DIY from '../assets/DIY-icon.png';

function ReportSection({
  title,
  findings,
  filters,
  filterCategory,
  setFilterCategory,
  filterUrgency,
  setFilterUrgency,
  formatCurrency
}) {
  // Function to determine urgency color scheme
  const getUrgencyColor = (urgencyLevel) => {
    const level = parseInt(urgencyLevel);
    if (isNaN(level)) return { bg: 'bg-gray-100', text: 'text-gray-800' };
    if (level >= 8) return { bg: 'bg-red-100', text: 'text-red-800' };
    if (level >= 6) return { bg: 'bg-orange-100', text: 'text-orange-800' };
    if (level >= 4) return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    return { bg: 'bg-green-100', text: 'text-green-800' };
  };

  return (
    <div className="mx-auto p-6 py-4">
      {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Exterior</span>
      </div> */}

      {/* Column Headers */}
      <div className="sticky top-5 grid grid-cols-4 gap-8 py-4 px-14 text-gray-600 text-lg bg-surface rounded-full mb-6 shadow-md">
        <div>What</div>
        <div>Repair</div>
        <div>Urgency</div>
        <div className="text-right">Estimate</div>
      </div>

      {/* Findings List */}
      <div className="space-y-5">
        {findings.map((finding, index) => (
          <motion.div 
            key={index}
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-surface rounded-lg p-6"
          >
            <div className="grid grid-cols-4 gap-8 p-6  border-gray-200">
              <div className="text-lg">{finding.item}</div>
              <div className="text-lg">{finding.recommendation}</div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((level) => (
                  <svg 
                    key={level}
                    className={`w-6 h-6 ${level <= finding.urgency ? 'text-amber-500' : 'text-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" 
                    />
                  </svg>
                ))}
              </div>
              <div className="text-right text-lg font-medium">
                {formatCurrency(finding.estimate)}
              </div>
            </div>

            {/* DIY Section */}
            <div className="grid grid-cols-4 gap-8 p-6 bg-white/30 m-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full">
                  <img src={DIY} alt="DIY" className="w-16 h-16" />
                </div>
                <span className="font-medium">Do it yourself?</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4].map((level) => (
                  <img 
                    key={level}
                    src={level <= finding.difficultyScore ? Hammer : HammerOutline}
                    alt="Difficulty level"
                    className="w-6 h-6"
                  />
                ))}
              </div>
              <div className="col-span-2">{finding.difficultyDescription}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ReportSection;
