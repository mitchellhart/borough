import React, { useState, useRef } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Auth({ onClose = () => {}, initialMode = 'login', initialEmail = '', onAuthSuccess }) {
  // Use initialMode prop to set the default mode
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();
  
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Starting authentication...');
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Signup successful:', userCredential);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential);
      }
      
      const idToken = await userCredential.user.getIdToken();
      console.log('Got ID token, making request to /api/link-auth');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/link-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          email: email,
          authId: userCredential.user.uid 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from /api/link-auth:', errorData);
        throw new Error(errorData.error || 'Failed to link auth');
      }

      const data = await response.json();
      console.log('Link auth response:', data);
      
      // Clear form
      setEmail('');
      setPassword('');
      setLoading(false);
      
      // Instead of navigating, just call onAuthSuccess
      // This will trigger the PaymentForm to show the checkout
      if (onAuthSuccess) {
        console.log('Calling onAuthSuccess');
        onAuthSuccess(userCredential.user);
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={() => onClose?.()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-semibold mb-6">
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </h2>

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={initialEmail !== ''}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {mode === 'signup' ? 'Sign Up' : 'Login'}
            </button>

            <div className="mt-4 text-center">
              {mode === 'login' ? (
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Get Started
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Auth; 