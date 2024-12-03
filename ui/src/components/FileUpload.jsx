import { useState } from 'react';
import { getAuth } from 'firebase/auth';

function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
      const token = await getAuth().currentUser.getIdToken();
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch('http://localhost:3001/api/files', {
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
      console.log('File uploaded successfully:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center
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

        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="font-medium">{selectedFile.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload; 