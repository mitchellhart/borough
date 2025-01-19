import React from 'react';
import { Link } from 'react-router-dom';
import BoroLogo from '../assets/boro-logo.svg';

function Footer() {
  return (
    <footer className="mt-auto py-4 text-center text-gray-600 text-sm">
    

      <div className="rounded-t-3xl sm:p-8 mt-10 h-[200px] relative" style={{ backgroundColor: '#6D8671' }}>
                <div className="mx-auto max-w-6xl px-4 my-10">
                    <div className="flex justify-between items-center"> {/* Changed to flex with justify-between */}
                        {/* Left Column */}
                        <div>
                            <img
                                src={BoroLogo}
                                alt="Boro Logo"
                                className="w-24 mb-6"
                            />
                        </div>
                        <div className="flex space-x-6 text-white">
                            <Link to="/terms" className="hover:underline">Terms of Use</Link>
                            <Link to="/pricing" className="hover:underline">Pricing</Link>
                            <Link to="/about" className="hover:underline">About Boro</Link>
                        </div>
                    </div>
                </div>
            </div>
    </footer>
  );
}

export default Footer; 