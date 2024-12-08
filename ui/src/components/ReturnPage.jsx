import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Auth from './Auth';

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
          
          // Only try to parse if it looks like JSON
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
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Processing your payment...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-green-600 mb-4">Payment Successful!</h2>
              <p>Thank you for your purchase. Let's set up your account to get started.</p>
            </div>
            
            <Auth 
              initialMode="signup"
              onAuthSuccess={() => navigate('/')}
            />
          </div>
        )}
        
        {status === 'failed' && (
          <div>
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Payment Failed</h2>
            <p className="mb-8">Something went wrong with your payment. Please try again.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReturnPage; 