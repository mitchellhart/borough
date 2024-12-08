import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const UserFiles = forwardRef((props, ref) => {
const navigate = useNavigate();


  const [userFiles, setUserFiles] = useState([]);

  const getAnalysis = (file) => {
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

  const fetchUserFiles = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.log('No user found');
        return;
      }

      const apiUrl = `${process.env.REACT_APP_API_URL}/api/files`;
      const token = await user.getIdToken();
      
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to fetch files: ${response.status} ${errorText}`);
      }

      const files = await response.json();
      const filesWithParsedAnalysis = files.map(file => ({
        ...file,
        parsedAnalysis: getAnalysis(file)
      }));
      setUserFiles(filesWithParsedAnalysis);
    } catch (error) {
      console.error('Error fetching user files:', error);
    }
  };

  useEffect(() => {
    fetchUserFiles();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: fetchUserFiles
  }));

  const handleView = (fileId) => {
    navigate(`/files/${fileId}`);
  };

  const handleDelete = async (fileId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.log('No user found');
        return;
      }

      const apiUrl = `${process.env.REACT_APP_API_URL}/api/files/${fileId}`;
      const token = await user.getIdToken();
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete file: ${response.status} ${errorText}`);
      }

      // Refresh the file list after successful deletion
      fetchUserFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const calculateTotalEstimate = (analysis) => {
    if (!analysis?.findings) return 0;
    
    return analysis.findings.reduce((total, finding) => {
      if (!finding.estimate || finding.estimate === "Variable") {
        return total;
      }
      
      if (typeof finding.estimate === 'number') {
        return total + finding.estimate;
      }
      
      const cleanedValue = finding.estimate.toString().replace(/[$,]/g, '');
      const amount = parseFloat(cleanedValue);
      return isNaN(amount) ? total : total + amount;
    }, 0);
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const MoreOptionsDropdown = ({ fileId }) => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[180px] bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-1 z-50"
          sideOffset={5}
        >
          <DropdownMenu.Item 
            className="text-red-500 hover:text-red-600 hover:bg-gray-100 flex items-center px-4 py-2 text-sm rounded cursor-pointer outline-none"
            onClick={() => handleDelete(fileId)}
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Reports</h2>
      
      {userFiles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reports uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userFiles.map((file) => (
            <div 
              key={file.id} 
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <svg 
                      className="w-5 h-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    <span className="font-medium text-gray-900 truncate">
                      {file.parsedAnalysis?.property?.address || file.original_name}
                    </span>
                  </div>
                  {file.parsedAnalysis?.property?.shortSummary && (
                    <p className="mt-1 text-sm text-gray-600 ml-8 text-left ">
                      {file.parsedAnalysis.property?.shortSummary}
                    </p>
                  )}
                </div>
                <span className="font-nohemi text-2xl font-bold text-gray-900 ml-4">
                  {formatCurrency(calculateTotalEstimate(file.parsedAnalysis))}
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-500">
                  Uploaded {new Date(file.upload_date).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleView(file.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                      />
                    </svg>
                    View
                  </button>
                  
                  <MoreOptionsDropdown fileId={file.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default UserFiles; 