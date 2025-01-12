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
    findings
  } = props;
  const [urgencyLevel, setUrgencyLevel] = useState('Necessary');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
      <div className="p-8 rounded-b-2xl bg-surface">
      <div className="mb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-l font-nohemi text-gray-800">{address}</h1>
            <h1 className="text-5xl font-nohemi text-gray-800">Inspection report: <br/> {date}</h1>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-medium text-gray-600 mb-2">
              Total Estimate
            </h2>
            <div className="text-8xl font-bold font-nohemi">${animatedTotal.toLocaleString()}</div>
          </div>
        </div>

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
              className="text-sm text-blue-600 hover:text-blue-800 ml-2 underline"
            >
              About these estimates
            </button>
    </div>
  );
}

export default ReportSummary; 