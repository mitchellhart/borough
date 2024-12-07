import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-auto py-4 text-center text-gray-600 text-sm">
      <Link to="/terms" className="hover:text-gray-900 underline">
        Terms of Service
      </Link>
    </footer>
  );
}

export default Footer; 