import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import NavBar from './components/NavBar';
import Auth from './components/Auth';
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import ReportsPreview from './components/ReportsPreview';
import ReportView from './components/ReportView';
import ScrollToTop from './components/ScrollToTop';
import PaymentForm from './components/PaymentForm';
import { motion } from "motion/react"
import { Helmet } from 'react-helmet';
import Terms from './components/Terms';
import About from './components/About';
import Pricing from './components/Pricing';
import ReturnPage from './components/ReturnPage';
import Account from './components/Account';
import { useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import openGraphImage from './assets/opengraph-borough-12-14-2024.jpg';
import Articles from './components/Articles';
import ArticlePage from './components/ArticlePage';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);


function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const userFilesRef = useRef();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();

  

  const handleUploadSuccess = async () => {
    // Refresh the UserFiles component
    userFilesRef.current?.refresh();
    
    // Fetch updated subscription status and credits
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/subscription-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setSubscriptionStatus(data.status);
        setCredits(data.credits || 0);
      } catch (error) {
        console.error('Error updating credits:', error);
      }
    }
  };
  
  useEffect(() => {
    const auth = getAuth();
    console.log('Starting auth check...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed, raw user:', user);
      
      if (user) {
        setUser(user);
        try {
          const token = await user.getIdToken();
          console.log('Got token:', !!token);
          
          const response = await fetch(`/api/subscription-status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          console.log('Subscription data:', {
            rawData: data,
            credits: data.credits,
            typeofCredits: typeof data.credits
          });
          
          setSubscriptionStatus(data.status);
          setCredits(data.credits || 0);
        } catch (error) {
          console.error('Error fetching subscription status:', error);
          setSubscriptionStatus(null);
          setCredits(0);
        }
      } else {
        console.log('No user found');
        setUser(null);
        setSubscriptionStatus(null);
        setCredits(0);
      }
    });
    
    return () => unsubscribe();
  }, []); 

  useEffect(() => {
    // Track page views
    const analytics = getAnalytics();
    logEvent(analytics, 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }, []); // Consider if you want this to run on route changes

  console.log('Render conditions:', {
    user: !!user,
    subscriptionStatus,
    credits,
    shouldShowUpload: user && (subscriptionStatus === 'active' || credits > 0)
  });

  return (
    <>
    <Helmet>
        <title>Boro Inspect</title>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Boro" />
        <link rel="manifest" href="/site.webmanifest" />


      </Helmet>
      
    {/* FULL PAGE BACKGROUND DIV */}
    
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="mx-auto w-full max-w-[1250px] px-4 flex-grow" >
        
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
                <div 
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
                      <div className="sm:p-8" style={{ backgroundColor: '#E6E2DD' }}>
                        <div className="rounded-b-3xl p-4 sm:p-8" style={{ backgroundColor: '#E6E2DD' }}>
                          <div className="col-span-full text-center py-6">
                            {credits > 0 ? (
                              // Show credits available
                              <div>
                                <h2 className="text-2xl font-bold text-[#395E44] mb-4">
                                  You have {credits} credit{credits !== 1 ? 's' : ''} remaining
                                </h2>
                                <div className="flex justify-center gap-4">
                                  <button
                                    onClick={() => navigate('/payment', { state: { planType: 'subscription' } })}
                                    className="bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-full text-lg font-medium hover:bg-opacity-90 transition-colors"
                                  >
                                    Subscribe for Access
                                  </button>
                                  <button
                                    onClick={() => navigate('/payment', { state: { planType: 'one-time' } })}
                                    className="border-2 border-[#395E44] text-[#395E44] py-4 px-8 rounded-full text-lg font-medium hover:bg-[#395E44] hover:text-white transition-colors"
                                  >
                                    Buy More Credits
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // No credits available
                              <div>
                                <h2 className="text-2xl font-bold text-[#395E44] mb-4">
                                  Subscribe or Buy Credits to analyze more reports.
                                </h2>
                                <div className="flex justify-center gap-4">
                                  <button
                                    onClick={() => navigate('/payment', { state: { planType: 'subscription' } })}
                                    className="bg-[#FFB252] text-[#395E44] py-4 px-8 rounded-full text-lg font-medium hover:bg-opacity-90 transition-colors"
                                  >
                                    Subscribe Now
                                  </button>
                                  <button
                                    onClick={() => navigate('/payment', { state: { planType: 'one-time' } })}
                                    className="border-2 border-[#395E44] text-[#395E44] py-4 px-8 rounded-full text-lg font-medium hover:bg-[#395E44] hover:text-white transition-colors"
                                  >
                                    Buy Single Credit
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>    
                      </div>   
                    )}
                    
                    {/* File Upload */}
                    {user && (subscriptionStatus === 'active' || credits > 0) && (
                      <div className="sm:p-8" style={{ backgroundColor: '#F7F7F7' }}>
                        <div className="col-span-full">
                          <FileUpload onFileProcessed={handleUploadSuccess} />
                        </div>
                      </div>
                    )}

                    {/* Reports Preview - shown for all logged in users */}
                    {user && (
                      <div className="sm:p-8" style={{ backgroundColor: '#F7F7F7' }}>
                        <div className="col-span-full" >
                          <ReportsPreview ref={userFilesRef} />
                        </div>
                      </div>
                    )}

        </div>
            
              } />
              
              <Route path="/subscribe" element={<PaymentForm />} />
              <Route path="/files/:fileId" element={<ReportView />} />
              
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/return" element={<ReturnPage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/payment" element={<PaymentForm />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticlePage />} />
            </Routes>

      </div>
      {/* <Footer /> */}
    </div>
  </>
  )
};

export default App; 