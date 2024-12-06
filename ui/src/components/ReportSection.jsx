import React from 'react';
import { motion } from "motion/react"

function ReportSection({
  item, issue, recommendation, category, urgency, estimate
}) {

  
  return (
    <motion.div 
    initial={{ y: 40 }}
    whileInView={{ y: 0 }}
    transition={{ duration: .5 }}
    className=" mx-auto p-6 py-20">
      <h1 className="text-4xl font-bold mb-8">{category}</h1>
      
      {/* Urgency Level Filter */}
      <div className="flex justify-end mb-6">
        <div className="relative w-48">
          <select className="w-full p-2 border rounded-md appearance-none">
            <option>All</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="font-semibold">Item</div>
        <div className="font-semibold">Status</div>
        <div className="font-semibold">Action</div>
        <div className="font-semibold">Estimate</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 py-4 border-b">
          <div>{item}</div>
          <div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
              Recommended
            </span>
          </div>
          <div>{recommendation}</div>
          <div className="relative">
            <div className="w-full p-2">{estimate}</div>
          </div>
        </div>
        {/* Add more rows as needed */}
      </div>

      {/* Summary Section */}
      <div className="mt-12 flex justify-between items-start">
        <div className="flex-1 pr-8">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <p className="text-gray-700">
            The inspection revealed several plumbing issues including a loose wetbar faucet and leaking
            shower head in the jack and jill bathroom, with estimated repairs totaling $474...
          </p>
        </div>
        
        {/* Total Amount */}
        <div className="text-right">
          <div className="text-lg font-semibold">Total</div>
          <div className="text-4xl font-bold">$2,100</div>
        </div>
      </div>
    </motion.div>
  );
}

export default ReportSection
