import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import costData from '../data/cost.json';
import colData from '../data/cost_of_living_index.csv?raw';
import ReactMarkdown from 'react-markdown';

const parsedData = Papa.parse(colData, {
  header: true,
  skipEmptyLines: true
}).data

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

// Add this custom hook before the ReportSummary component
function useCountUp(end, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

function ReportSummary(props) {
  const { 
    address, 
    date, 
    inspector, 
    license, 
    estimate, 
    summary,
    findings,
    file
  } = props;
  const [urgencyLevel, setUrgencyLevel] = useState('Necessary');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);
  

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isReportModalOpen) {
        setIsReportModalOpen(false);
      }
    };

    // Add event listener when modal is open
    if (isReportModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup: remove event listener when component unmounts or modal closes
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isReportModalOpen]); // Only re-run effect when isModalOpen changes

  
  // Calculate categories from findings data
  const categories = useMemo(() => {
    if (!findings) return [];
    
    // Create a map to aggregate costs by category
    const categoryMap = findings.reduce((acc, finding) => {
      const category = finding.category;
      let cost = 0;
      
      // Convert estimate to number, handling different formats
      if (typeof finding.estimate === 'number') {
        cost = finding.estimate;
      } else if (finding.estimate && finding.estimate !== 'Variable') {
        cost = parseFloat(finding.estimate.toString().replace(/[$,]/g, '')) || 0;
      }
      
      if (!acc[category]) {
        acc[category] = { name: category, cost: 0 };
      }
      acc[category].cost += cost;
      return acc;
    }, {});
    
    // Convert map to array and sort by cost
    return Object.values(categoryMap).sort((a, b) => b.cost - a.cost);
  }, [findings]);


  const animatedTotal = useCountUp(estimate, 2000);

  const chartData = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        data: categories.map(cat => cat.cost),
        backgroundColor: '#1E40AF', // Dark blue color
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        },
        grid: {
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
      <div className="p-8 pt-16 bg-[#F7F7F7]">
      <div className="mb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-l font-nohemi text-gray-800">{address}</h1>
            <h1 className="text-5xl font-nohemi text-gray-800">Inspection report: <br/> {date}</h1>
            
            <button 
            onClick={openReportModal}
            class="hover:bg-gray-200 text-sm text-gray-800 font-bold py-2 px-2 rounded-xl inline-flex gap-2 items-center border mt-10">
              
              <span>View Original</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-medium text-gray-600 mb-2">
              Total Estimate
            </h2>
            <div className="text-8xl font-bold font-nohemi">${animatedTotal.toLocaleString()}</div>
          </div>
        </div>

        {isReportModalOpen && ( 
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
            <div className="bg-white rounded-lg shadow-md p-6 m-4 w-5/6 h-5/6 max-w-7xl flex flex-col relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Original Inspection Document</h2>
                <button 
                  onClick={closeReportModal}
                  className="text-gray-500 hover:text-gray-700"
                  class="hover:bg-gray-200 text-sm text-gray-800 font-bold py-2 px-2 rounded-xl inline-flex gap-2 items-center border"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="prose max-w-none overflow-y-auto flex-grow">
                <ReactMarkdown>{file.text_content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-2xl mx-4">
             
                <h3 className="text-xl font-bold mb-4">About These Estimates</h3>
              <p className="text-gray-700 mb-4">
                Please note that these estimates are preliminary assessments based on typical repair costs and visible conditions. 
                The actual costs may vary significantly depending on:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Detailed inspection findings</li>
                <li>Material choices and availability</li>
                <li>Labor costs in your area</li>
                <li>Hidden damage or complications</li>
                <li>Market conditions and timing</li>
              </ul>
              <p className="text-gray-700 mb-6">
                These estimates are provided for planning purposes only and do not constitute a quote or legally binding agreement. 
                We recommend obtaining detailed quotes from licensed contractors for accurate pricing.
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <hr className="border-gray-300 my-10" />

        <div className="flex justify-between items-start mb-8">
          <div className="max-w-3xl">
            <h3 className="text-xl font-bold mb-4">Summary</h3>
            <p className="text-gray-800 text-base">
              {summary}
            </p>
          </div>
          {/* Cost multiplier notice - shows for all reports */}
          <div className="bg-orange-50 p-6 rounded-lg ml-8">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-nohemi-medium text-orange-800">LOCATION COST FACTOR</h4>
              <span className="text-lg font-nohemi-medium text-orange-800">
                {(costData.find(city => city.city.includes('Seattle')) || {}).multiplierMax || '1.1'}X
              </span>
            </div>
            <p className="text-base text-orange-800">
              {costData && costData.some(city => address.includes('Seattle'))
                ? `This property is located in Seattle, where construction and repair costs are typically ${
                    (costData.find(city => city.city.includes('Seattle')) || {}).multiplierMax || '1.1'
                  }x the national average.`
                : "This property is located in an area where construction and repair costs are typically in line with the national average."
              }
            </p>
          </div>
        </div>

        <div className="h-96 w-full mb-12">
          <Bar data={chartData} options={chartOptions} />
        </div>
        
      </div>
      <button
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-gray-400 text-sm text-gray-800 font-bold py-2 px-2 rounded-xl inline-flex gap-2 items-center border"
            >
              About these estimates
            </button>
    </div>
  );
}

export default ReportSummary; 