import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function FileUpload({ onFileProcessed }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleChange = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      handleFiles(files);
    }
  };

  const handleFiles = async (files) => {
    try {
      setIsLoading(true);
      const token = await getAuth().currentUser.getIdToken();
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch(`${API_URL}/api/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      await analyzeFile(data.file.id, token);
      console.log('File uploaded successfully:', data);
      
      if (onFileProcessed) onFileProcessed();
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeFile = async (fileId, token) => {
    const response = await fetch(`${API_URL}/api/files/${fileId}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('AI analyzed successfully:', data);
    return data;
  };

  return (
    <>
    <div className="rounded-b-3xl sm:p-8">
    <div className="w-full max-w-md mx-auto p-6">
      <div 
        className={`border-2 border-dashed border-white rounded-lg p-8 text-center
          ${dragActive ? 'border-black bg-gray-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
        />
        <label 
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <div className="space-y-4">
            <svg 
              className="mx-auto w-8 h-8 text-black"
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-black font-medium">
              Drag and drop your<br />Inspection Report here
            </p>
            <label 
              htmlFor="file-upload" 
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg w-full block cursor-pointer"
            >
              Select File
            </label>
          </div>
        </label>

        {selectedFile && !isLoading && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="font-medium">{selectedFile.name}</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 p-4">
            <div className="h-[50px] w-[50px] mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
            <p className="mt-2 text-gray-600">Analyzing your file...</p>
          </div>
        )}
      </div>
    </div>
    </div>
    </>
  );
}

export default FileUpload; 