import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const UserFiles = forwardRef((props, ref) => {
const navigate = useNavigate();

  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    allEnvVars: process.env
  });

  const [userFiles, setUserFiles] = useState([]);

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
      setUserFiles(files);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Reports</h2>
      
      {userFiles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userFiles.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex-1 min-w-0 mr-4">
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
                    {file.original_name}
                  </span>
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    Uploaded {new Date(file.upload_date).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    {(file.file_size / 1024).toFixed(2)} KB
                  </span>
                </div>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default UserFiles; 