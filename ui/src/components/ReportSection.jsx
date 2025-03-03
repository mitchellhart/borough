import React, { useState, useEffect } from 'react';
import { motion } from "motion/react"
// import { ReactComponent as HammerIcon } from '/src/assets/hammer-ico.svg';
import Hammer from '/src/assets/hammer-solid.svg';
import HammerOutline from '/src/assets/hammer-outline.svg';
import DIY from '/src/assets/DIY-icon.png';

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
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    // Add event listener when modal is open
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup: remove event listener when component unmounts or modal closes
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]); // Only re-run effect when isModalOpen changes

  // Functions to handle modal open/close
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
    <div className="mx-auto py-4">

      <h2 className="text-4xl ml-14 font-bold mb-8 text-[#395E44]">All Items</h2>

      {/* Column Headers */}
      <div className="sticky top-0 grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 py-8 px-14 text-gray-900 text-md font-bold bg-[#f7f7f7] mb-6 border-b z-10">
        <div>Item</div>
        <div>Description</div>
        <div>Urgency</div>
        <div className="text-right">Estimate</div>
      </div>

      {/* Individual Items List */}
      <div className="space-y-5 px-4">
        {findings.map((finding, index) => (
          <motion.div
            key={index}
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#f7f7f7]rounded-lg p-8 border-b-2"
          >
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 border-gray-200">
              <div className="text-lg">{finding.item}</div>
              <div className="">{finding.recommendation}</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
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

            <button 
            onClick={openModal}
            class="hover:bg-gray-400 text-sm text-gray-800 font-bold py-2 px-2 rounded-xl inline-flex gap-2 items-center border mt-10">

              
              <span>Do it yourself?</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>

             {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Do it yourself?</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-rows-2 gap-8 bg-white/30 ">
             
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
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

          </motion.div>
        ))}
      </div>
      
     
    </div>
  );
}

export default ReportSection;
