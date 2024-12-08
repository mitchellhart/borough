import React from 'react';
import { motion } from "motion/react"

function ReportSection({
  item, issue, recommendation, category, urgency, estimate
}) {

   // Function to determine urgency color scheme
   const getUrgencyColor = (urgencyLevel) => {
    // Convert urgency to number if it's a string
    const level = parseInt(urgencyLevel);
    
    if (isNaN(level)) return { bg: 'bg-gray-100', text: 'text-gray-800' }; // fallback
    
    if (level >= 8) return { bg: 'bg-red-100', text: 'text-red-800' };
    if (level >= 6) return { bg: 'bg-orange-100', text: 'text-orange-800' };
    if (level >= 4) return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    return { bg: 'bg-green-100', text: 'text-green-800' };
  };

  const urgencyColors = getUrgencyColor(urgency);

  return (
    <motion.div 
      initial={{ y: 40 }}
      whileInView={{ y: 0 }}
      transition={{ duration: .5 }}
      className="mx-auto p-6 py-4"
    >
      <div className="grid grid-cols-10 gap-4 py-4 border-b">
        <div className="col-span-2">{item}</div>
        <div className="col-span-1">{category}</div>
        <div className="col-span-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
            Recommended
          </span>
        </div>
        <div className="col-span-2">{recommendation}</div>
        <div className="col-span-1">
          <span className={`px-3 py-1 rounded-full text-sm ${urgencyColors.bg} ${urgencyColors.text}`}>
            {urgency}
          </span>
        </div>
        <div className="col-span-1 relative text-right">
          <div className="w-full p-2">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(Number(estimate))}
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
    </motion.div>
  );
}

export default ReportSection
