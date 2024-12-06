import React from 'react';

function FileInfoCard({ file, onDownload }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-xl ml-6">
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

      <div className="mb-6">
        <p className="text-sm text-gray-500">Upload Date</p>
        <p className="font-medium text-gray-900">
          {new Date(file.upload_date).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onDownload}
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
  );
}

export default FileInfoCard; 