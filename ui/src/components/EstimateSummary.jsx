import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

// Add this custom hook before the EstimateSummary component
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

function EstimateSummary(props) {
  const { address, date, inspector, license, estimate, summary } = props;
  const [urgencyLevel, setUrgencyLevel] = useState('Necessary');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const categories = [
    { name: 'Plumbing', cost: 2100 },
    { name: 'Electric', cost: 1800 },
    { name: 'Roofing', cost: 1100 },
    { name: 'Mason', cost: 200 },
    { name: 'HVAC', cost: 1900 },
    { name: 'Drywall', cost: 200 },
    { name: 'Gutters', cost: 400 },
    { name: 'Windows', cost: 1000 },
    { name: 'Appliance', cost: 200 },
  ];

  // const totalEstimate = categories.reduce((sum, cat) => sum + cat.cost, 0);
  
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
      <div className="p-8">
      <div className="mb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-l font-nohemi text-gray-800">{address}</h1>
            <h1 className="text-5xl font-nohemi text-gray-800">Inspection report: <br/> {date}</h1>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-medium text-gray-600 mb-2">
              Estimate
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

        <hr className="border-gray-200 mb-8" />

        <div className="flex justify-between items-start mb-8">
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Summary</h3>
            <p className="text-gray-700">
              {summary}
            </p>
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-600 mb-2">
              Urgency Level
            </label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 leading-tight focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option>Critical</option>
              <option>Necessary</option>
              <option>Recommended</option>
              <option>Optional</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="h-96 w-full mb-12">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-9 gap-4">
          {categories.map((cat) => (
            <div key={cat.name} className="text-center">
              <div className="font-medium">{cat.name}</div>
              <div className="text-gray-600">${cat.cost}</div>
            </div>
          ))}

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

export default EstimateSummary; 