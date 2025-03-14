import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ReportSummary from './ReportSummary';
import ReportSection from './ReportSection';
import { motion } from "motion/react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel
} from '@tanstack/react-table'
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, CaretSortIcon } from '@radix-ui/react-icons';
import FindingsTable from './FindingsTable';
import SystemsOverview from './SystemsOverview.jsx';
import NegotiationGuide from './NegotiationGuide';

function ReportView() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [activeSection, setActiveSection] = useState('summary');
  const auth = getAuth();
  const [sorting, setSorting] = useState([{
    id: 'urgency',
    desc: false
  }]);

  // Add refs for scrolling
  const summaryRef = React.useRef(null);
  const itemsRef = React.useRef(null);
  const negotiationRef = React.useRef(null);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const refs = {
      summary: summaryRef,
      items: itemsRef,
      negotiation: negotiationRef
    };
    
    if (refs[sectionId]?.current) {
      refs[sectionId].current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getAnalysis = () => {
    if (!file?.ai_analysis) return null;
    try {
      const analysis = typeof file.ai_analysis === 'string'
        ? JSON.parse(file.ai_analysis)
        : file.ai_analysis;

      return analysis;
    } catch (error) {
      console.error('Error parsing AI analysis:', error);
      return null;
    }
  };

  const filters = useMemo(() => {
    if (!getAnalysis()?.findings) return { categories: [], urgencyLevels: [] };

    const findings = getAnalysis().findings;
    console.log('Available urgency levels:', [...new Set(findings.map(f => f.urgency))]);

    return {
      categories: ['all', ...new Set(findings.map(f => f.category))],
      urgencyLevels: ['all', ...new Set(findings.map(f => f.urgency))]
    };
  }, [file]);

  const processedFindings = useMemo(() => {
    let findings = getAnalysis()?.findings || [];

    // Apply filters
    if (filterCategory !== 'all') {
      findings = findings.filter(f => f.category === filterCategory);
    }
    if (filterUrgency !== 'all') {
      findings = findings.filter(f => {
        const findingUrgency = String(f.urgency || '').toLowerCase();
        const filterValue = String(filterUrgency).toLowerCase();
        return findingUrgency === filterValue;
      });
    }

    return findings;
  }, [file, filterCategory, filterUrgency]);

  useEffect(() => {
    const fetchFileMetadata = async (user) => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/files/${fileId}`,
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

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

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

  return (
    <div className="container mx-auto relative">
      
      {/* Fixed right-side table of contents */}
      {file && (
        <div className="fixed right-6 bottom-6 z-20 bg-white shadow-lg rounded-xl p-3 w-50">
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-1">Contents</h3>
            <button 
              onClick={() => scrollToSection('summary')}
              className={`text-left px-2 py-1 text-sm font-medium ${activeSection === 'summary' ? 'text-primary border-l-2 border-primary pl-1' : 'text-gray-600'}`}
            >
              Summary
            </button>
            <button 
              onClick={() => scrollToSection('items')}
              className={`text-left px-2 py-1 text-sm font-medium ${activeSection === 'items' ? 'text-primary border-l-2 border-primary pl-1' : 'text-gray-600'}`}
            >
              Items
            </button>
            <button 
              onClick={() => scrollToSection('negotiation')}
              className={`text-left px-2 py-1 text-sm font-medium ${activeSection === 'negotiation' ? 'text-primary border-l-2 border-primary pl-1' : 'text-gray-600'}`}
            >
              Negotiation Guide
            </button>
          </div>
        </div>
      )}

      {file && file.ai_analysis && (
        <div 
        
        className="flex flex-col pb-60 bg-[#F7F7F7]"
        >
          <div ref={summaryRef}>
          <ReportSummary
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
            findings={getAnalysis()?.findings || []}
            file={file}
          />
          </div>
          
          {/* Systems Overview Section */}
          {/* <SystemsOverview /> */}

          <div ref={itemsRef}>
            <ReportSection
              title="Summary"
              findings={processedFindings}
              filters={filters}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterUrgency={filterUrgency}
              setFilterUrgency={setFilterUrgency}
              formatCurrency={formatCurrency}
            />
          </div>

          
            {/* <FindingsTable
              findings={processedFindings}
              filters={filters}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterUrgency={filterUrgency}
              setFilterUrgency={setFilterUrgency}
              formatCurrency={formatCurrency}
            /> */}
          

          <div ref={negotiationRef}>
            <NegotiationGuide 
              totalEstimate={calculateTotalEstimate()}
            />
          </div>
          
        </div>
      )}
    </div>
  );
}

export default ReportView; 