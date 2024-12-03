import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import NavBar from './components/NavBar';
import Auth from './components/Auth';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import UserFiles from './components/UserFiles';
import BoroughLogo from './assets/Borough-logo.svg';
import FileView from './components/FileView';
import ScrollToTop from './components/ScrollToTop';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const userFilesRef = useRef();

  const handleUploadSuccess = () => {
    // Refresh the UserFiles component
    userFilesRef.current?.refresh();
  };
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#85E5B5' }}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <NavBar onLoginClick={() => setShowAuth(true)} user={user} />
          {showAuth && <Auth onClose={() => setShowAuth(false)} />}
            <ScrollToTop />
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <div className="container mx-auto max-w-3xl text-center">
                  <img src={BoroughLogo} alt="Borough" className="mx-auto mb-4 h-24 mt-40" />
                  <p className="text-xl text-gray-600 mb-16">Analyze your Inspection Report in seconds</p>
                  <FileUpload onUploadSuccess={handleUploadSuccess} />
                  {user && <UserFiles ref={userFilesRef} />}
                </div>
              </div>
            } />
            <Route path="/files/:fileId" element={<FileView />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App; 