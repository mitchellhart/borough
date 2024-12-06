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
import ReportView from './components/ReportView';
import ScrollToTop from './components/ScrollToTop';
import PaymentForm from './components/PaymentForm';
import { motion } from "motion/react"
import { Helmet } from 'react-helmet';


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
  const [showPayment, setShowPayment] = useState(false);
  

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
    <>
    <Helmet>
        <title>Borough</title>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Borough" />
<link rel="manifest" href="/site.webmanifest" />
      </Helmet>
    <div className="min-h-screen" style={{ backgroundColor: '#85E5B5' }}>
      <motion.div 
      initial={{ 
        y: 50, 
        opacity: 0 }} 
      animate={{ 
        y: 0, 
        opacity: 1, 
        transition: { duration: 1, type: 'spring', stiffness: 100 }
      }}  
      className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-3xl p-8">
          <NavBar onLoginClick={() => setShowAuth(true)} user={user} />
          {showAuth && <Auth onClose={() => setShowAuth(false)} />}
          {showPayment && <PaymentForm onClose={() => setShowPayment(false)} />}
          <ScrollToTop />
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center min-h-[80vh]">
                <div className="container mx-auto max-w-3xl text-center">
                  {!user && <img src={BoroughLogo} alt="Borough" className="mx-auto mb-4 h-24 mt-40" />}
                  {!user && <p className="text-xl text-gray-600 mb-16">Analyze your Home Inspection Report in Seconds</p>}
                  
                  {!user && 
                  
                  <button
                  onClick={() => setShowPayment(true)}
                  className="bg-blue-500 text-white py-4 px-8 rounded-full mb-4"
                  >
                    Get Started
                  </button>
                  }

                  {user && <FileUpload onFileProcessed={() => userFilesRef.current?.refresh()} />}
                  {user && <UserFiles ref={userFilesRef} />}
                </div>
              </div>
            } />
            <Route path="/files/:fileId" element={<ReportView />} />
          </Routes>
        </div>
      </motion.div>
    </div>
  </>
  )
};

export default App; 