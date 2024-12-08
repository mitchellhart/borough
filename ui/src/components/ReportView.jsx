import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import EstimateSummary from './EstimateSummary';
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

function ReportView() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const auth = getAuth();
  const [sorting, setSorting] = useState([{
    id: 'urgency',
    desc: false
  }]);

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

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'item',
        header: 'Item',
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'urgency',
        header: ({ column }) => {
          return (
            <div
              className="cursor-pointer select-none flex items-center gap-1"
              onClick={column.getToggleSortingHandler()}
            >
              Urgency
              {column.getIsSorted() ? (
                column.getIsSorted() === 'asc' ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )
              ) : (
                <CaretSortIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const urgencyOrder = {
            'Critical': 1,
            'High': 2,
            'Medium': 3,
            'Low': 4,
            'Informational': 5
          };
          
          const aValue = urgencyOrder[rowA.original.urgency] || 999;
          const bValue = urgencyOrder[rowB.original.urgency] || 999;
          
          return aValue - bValue;
        }
      },
      {
        accessorKey: 'estimate',
        header: ({ column }) => {
          return (
            <div
              className="cursor-pointer select-none flex items-center gap-1"
              onClick={column.getToggleSortingHandler()}
            >
              Estimate
              {column.getIsSorted() ? (
                column.getIsSorted() === 'asc' ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )
              ) : (
                <CaretSortIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        },
        cell: ({ getValue }) => {
          const value = getValue();
          return value === "Variable" ? value : formatCurrency(value);
        },
        sortingFn: (rowA, rowB) => {
          const getNumericValue = (value) => {
            if (!value) return 0;
            if (value === "Variable") return 0;
            if (typeof value === 'number') return value;
            
            const numericValue = parseFloat(value.toString().replace(/[$,]/g, ''));
            return isNaN(numericValue) ? 0 : numericValue;
          };

          const aValue = getNumericValue(rowA.original.estimate);
          const bValue = getNumericValue(rowB.original.estimate);
          
          return aValue - bValue;
        }
      },
    ],
    []
  )

  const table = useReactTable({
    data: processedFindings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    enableSortingRemoval: true,
    sortDescFirst: false,
  })

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

  return (
    <div className="container mx-auto">
      {/* Simplify header to just the back button */}
      <div className="flex items-center mb-6 ml-6">
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

      {/* Remove the ref from this div */}
      {file && file.ai_analysis && (
        <div>
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
            findings={getAnalysis()?.findings || []}
          />

          {/* Filter controls */}
          <div className="flex gap-4 mb-6 py-6">
            <Select.Root value={filterCategory} onValueChange={setFilterCategory}>
              <Select.Trigger 
                className="inline-flex items-center justify-between rounded px-4 py-2 text-sm gap-2 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none"
                aria-label="Category"
              >
                <Select.Value placeholder="Select a category" />
                <Select.Icon>
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content 
                  className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200"
                  position="popper"
                  sideOffset={5}
                >
                  <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                    <ChevronUpIcon />
                  </Select.ScrollUpButton>
                  
                  <Select.Viewport className="p-1">
                    {filters.categories.map((category) => (
                      <Select.Item
                        key={category}
                        value={category}
                        className="relative flex items-center px-6 py-2 text-sm text-gray-700 rounded-sm
                        "
                      >
                        <Select.ItemText>{category}</Select.ItemText>
                        <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                          <CheckIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>

            <Select.Root value={filterUrgency} onValueChange={setFilterUrgency}>
              <Select.Trigger 
                className="inline-flex items-center justify-between rounded px-4 py-2 text-sm gap-2 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none"
                aria-label="Urgency"
              >
                <Select.Value placeholder="Select urgency" />
                <Select.Icon>
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content 
                  className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200"
                  position="popper"
                  sideOffset={5}
                >
                  <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                    <ChevronUpIcon />
                  </Select.ScrollUpButton>
                  
                  <Select.Viewport className="p-1">
                    {filters.urgencyLevels.map((level) => (
                      <Select.Item
                        key={level}
                        value={level}
                        className="relative flex items-center px-6 py-2 text-sm text-gray-700 rounded-sm hover:bg-gray-100 cursor-pointer outline-none data-[highlighted]:bg-gray-100"
                      >
                        <Select.ItemText>{level === 'all' ? 'All Urgency Levels' : level}</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-1 inline-flex items-center">
                          <CheckIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>

                  <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                    <ChevronDownIcon />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium text-gray-500 bg-gray-50"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b">
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportView; 