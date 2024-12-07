import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import EstimateSummary from './EstimateSummary';
import ReportSection from './ReportSection';
import { motion } from "motion/react"
// import FileInfoCard from './FileInfoCard';

function ReportView() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchFileMetadata = async (user) => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/files/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('File not found');
        }

        const data = await response.json();
        console.log('Full file data structure:', JSON.stringify(data, null, 2));
        console.log('AI Analysis structure:', JSON.stringify(data.ai_analysis, null, 2));
        setFile(data);
      } catch (error) {
        console.error('Error fetching file:', error);
        setError('Failed to load file information');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchFileMetadata(user);
      } else {
        setLoading(false);
        navigate('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fileId, navigate, auth]);

  // Add a debug check before render
  console.log('Current file state:', file);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Return to Files
          </button>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">File not found</p>
        </div>
      </div>
    );
  }




  const calculateTotalEstimate = () => {
    const analysis = getAnalysis();
    if (!analysis?.findings) return 0;
    
    const total = analysis.findings.reduce((total, finding) => {
      console.log('Processing finding:', finding.item);
      console.log('Estimate value:', finding.estimate);
      
      // Skip if estimate is "Variable" or undefined
      if (!finding.estimate || finding.estimate === "Variable") {
        console.log('Skipping due to Variable or undefined');
        return total;
      }
      
      if (typeof finding.estimate === 'number') {
        return total + finding.estimate;
      }
      
      // Handle string values
      // Remove '$' and any commas, then convert to number
      const cleanedValue = finding.estimate.toString().replace(/[$,]/g, '');
      console.log('Cleaned value:', cleanedValue);
      
      const amount = parseFloat(cleanedValue);
      console.log('Parsed amount:', amount);
      
      // Only add if it's a valid number
      const newTotal = isNaN(amount) ? total : total + amount;
      console.log('Running total:', newTotal);
      
      return newTotal;
    }, 0);

    console.log('Final total:', total);
    return total;
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const getAnalysis = () => {
    if (!file?.ai_analysis) return null;
    try {
      return typeof file.ai_analysis === 'string' 
        ? JSON.parse(file.ai_analysis) 
        : file.ai_analysis;
    } catch (error) {
      console.error('Error parsing AI analysis:', error);
      return null;
    }
  };

  return (
    <div className="container mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6 ml-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg 
            className="w-6 h-6 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back
        </button>
      </div>

      <div className="max-w-xl p-6">
        {/* <div className="bg-white rounded-lg shadow-sm p-6"> */}
          {/* <FileInfoCard file={file} onDownload={handleDownload} /> */}
        {/* </div> */}
      </div>

      {file && file.ai_analysis && (
        <>
          <EstimateSummary
            address={getAnalysis()?.property?.address || 'No address available'}
            date={getAnalysis()?.property?.inspectionDate || 'No date available'}
            inspector={getAnalysis()?.property?.inspectedBy?.name || 'No inspector available'}
            license={getAnalysis()?.property?.inspectedBy?.license || 'No license available'}
            estimate={calculateTotalEstimate()}
            summary={getAnalysis()?.property?.summary || 'No summary available'}
            shortSummary={getAnalysis()?.property?.shortSummary || 'No short summary available'}
            fileName={file.name}
            fileSize={file.size}
            uploadDate={file.uploadDate}
            status={file.status}
          />

          {getAnalysis()?.findings?.map((item) => (
            <ReportSection
              key={item.item}
              item={item.item}
              issue={item.issue}
              category={item.category}
              recommendation={item.recommendation}
              urgency={item.urgency}
              estimate={item.estimate}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default ReportView; 