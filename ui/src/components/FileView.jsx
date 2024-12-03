import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import EstimateSummary from './EstimateSummary';

function FileView() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {

    const fetchFileMetadata = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

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
        setFile(data);
      } catch (error) {
        console.error('Error fetching file:', error);
        setError('Failed to load file information');
      } finally {
        setLoading(false);
      }
    };

    fetchFileMetadata();
  }, [fileId, navigate]);

  const handleDownload = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/files/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

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

  return (
    <div className="container mx-auto">
      <EstimateSummary />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
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

          {/* File Information Card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <svg 
                className="w-8 h-8 text-gray-400 mr-3" 
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
              <h1 className="text-2xl font-semibold text-gray-800">{file.original_name}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Internal Filename</p>
                <p className="font-medium text-gray-900">{file.filename}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">File Size</p>
                <p className="font-medium text-gray-900">
                  {(file.file_size / 1024).toFixed(2)} KB
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Upload Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(file.upload_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">File Type</p>
                <p className="font-medium text-gray-900">
                  {file.mime_type || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                  />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileView; 