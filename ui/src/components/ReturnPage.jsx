import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BoroughLogo from '../assets/Borough-logo.svg';

function ReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    console.log('Session ID:', sessionId);
    
    if (sessionId) {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      console.log('Fetching session status from:', `${apiUrl}/api/session-status`);
      
      fetch(`${apiUrl}/api/session-status?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(async res => {
          console.log('Response status:', res.status);
          const text = await res.text();
          console.log('Raw response:', text);
          
          if (text.trim().startsWith('{')) {
            try {
              const data = JSON.parse(text);
              console.log('Session status data:', data);
              if (data.status === 'complete' || data.status === 'completed') {
                setStatus('success');
              } else {
                setStatus('failed');
                console.log('Failed because status was:', data.status);
              }
            } catch (parseError) {
              console.error('Error parsing JSON:', parseError);
              setStatus('failed');
            }
          } else {
            console.error('Received non-JSON response:', text.substring(0, 100));
            setStatus('failed');
          }
        })
        .catch(error => {
          console.error('Error fetching session status:', error);
          setStatus('failed');
        });
    }
  }, [searchParams]);

  return (
    <div className="fixed inset-0 flex">
      {/* Left Panel - Brand Info */}
      <div className="w-1/2 p-12 flex flex-col" style={{ backgroundColor: '#E6E2DD' }}>
        <div className="flex-1 flex flex-col justify-center">
          <img src={BoroughLogo} alt="Borough" className="w-24 mb-6" />
          <h1 className="text-[#395E44] text-4xl sm:text-5xl lg:text-6xl font-nohemi leading-tight mb-8">
            {status === 'success' 
              ? 'Welcome to Borough!'
              : status === 'failed'
              ? 'Something went wrong'
              : 'Processing your payment...'}
          </h1>

          {/* Feature list styled like landing page */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-lg">
              <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span>Instant AI Analysis</span>
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span>Detailed Cost Estimates</span>
            </div>
            <div className="flex items-center space-x-4 text-lg">
              <div className="w-6 h-6 rounded-full bg-[#395E44] flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span>Priority Rankings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Status */}
      <div className="w-1/2 bg-white p-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#395E44] mx-auto mb-6"></div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processing your payment...</h2>
              <p className="text-gray-600">This will only take a moment.</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#395E44] flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[#395E44] mb-4">
              You can now start analyzing your home inspection reports.
              </h2>
              
              <button
                onClick={() => navigate('/')}
                className="bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Failed</h2>
              <p className="mb-8 text-gray-600">Something went wrong with your payment. Please try again.</p>
              <button
                onClick={() => navigate('/')}
                className="bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-2xl text-lg font-bold hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReturnPage; 