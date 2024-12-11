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
import Footer from './components/Footer';
import Terms from './components/Terms';
import ReturnPage from './components/ReturnPage';
import Account from './components/Account';
import { useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';



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
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const navigate = useNavigate();

  

  const handleUploadSuccess = () => {
    // Refresh the UserFiles component
    userFilesRef.current?.refresh();
  };
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed, user:', user);
      setUser(user);
      
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`/api/subscription-status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          console.log('Raw subscription response:', data);
          console.log('Setting subscription status to:', data.status);
          setSubscriptionStatus(data.status);
        } catch (error) {
          console.error('Error fetching subscription status:', error);
          setSubscriptionStatus(null);
        }
      } else {
        setSubscriptionStatus(null);
      }
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E6E2DD' }}>
      <div className="mx-auto w-full max-w-[1250px] px-4 flex-grow">
        
            <NavBar onLoginClick={() => setShowAuth(true)} user={user} />
            {showAuth && (
              <Auth 
                onClose={() => setShowAuth(false)}
                initialMode='login'
                onAuthSuccess={() => {
                  console.log('Current subscription status:', subscriptionStatus);
                  setShowAuth(false);
                  // if (!subscriptionStatus || subscriptionStatus !== 'active') {
                  //   navigate('/subscribe');
                  // }
                }}
              />
            )}
            <ScrollToTop />
            <Routes>
              <Route path="/" element={
                <motion.div 
                initial={{ y: -50, opacity: 0 }} 
                animate={{ 
                  y: 0, 
                  opacity: 1, 
                  transition: { duration: 0.4, type: 'easeOut', stiffness: 100 }
                }}  
              >
                    {!user && 
                      <div >
                        <LandingPage />                     
                      </div>
                    }

                    {/* Subscription Status Content */}
                    {user && subscriptionStatus !== 'active' && (
                        <div className="rounded-b-3xl p-4 sm:p-8" style={{ backgroundColor: '#E6E2DD' }}>
                          <div className="col-span-full text-center py-6">
                            <h2 className="text-2xl font-bold text-[#395E44] mb-4">
                              Subscribe to Access All Features
                            </h2>
                            <button
                              onClick={() => navigate('/subscribe')}
                              className="bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-full text-lg font-medium hover:bg-opacity-90 transition-colors"
                            >
                              Subscribe Now
                            </button>
                          </div>
                      </div>       
                    )}
                    
                    {/* File Upload and User Files */}
                    {user && subscriptionStatus === 'active' && (
                      <div className="col-span-full">
                        <FileUpload onFileProcessed={() => userFilesRef.current?.refresh()} />
                        <UserFiles ref={userFilesRef} />
                      </div>
                    )}

        </motion.div>
            
              } />
              
              <Route path="/subscribe" element={<PaymentForm />} />
              <Route path="/files/:fileId" element={<ReportView />} />
              
              <Route path="/terms" element={<Terms />} />
              <Route path="/return" element={<ReturnPage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/payment" element={<PaymentForm />} />
            </Routes>

      </div>
      {/* <Footer /> */}
    </div>
  </>
  )
};

export default App; 