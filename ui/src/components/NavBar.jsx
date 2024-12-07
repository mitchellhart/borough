import { useState, useRef, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import BoroughLogo from '../assets/Borough-logo.svg';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function NavBar({ onLoginClick, user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isIndexPage = location.pathname === '/';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const UserMenu = () => (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 focus:outline-none"
      >
        <span className="text-gray-600">
          {user.email.charAt(0).toUpperCase()}
        </span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div 
            className="py-1" 
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="user-menu"
          >
            <Link
              to="/account"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              Account
            </Link>
            <Link
              to="/reports"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              Reports
            </Link>
            <div className="border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render different styles for index page
  if (isIndexPage) {
    return (
      <div className="w-full px-4 flex justify-end items-center">
        {user && (
          <>
            <div className="flex-grow">
              <Link to="/">
                <img src={BoroughLogo} alt="Borough" className="h-6" />
              </Link>
            </div>
            <UserMenu />
          </>
        )}
        {!user && (
          <button
            onClick={onLoginClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
          >
            Login
          </button>
        )}
      </div>
    );
  }

  // Regular navbar for other pages
  return (
    <nav className="p-8">
      <div className="flex justify-between items-center">
        <Link to="/">
          <img src={BoroughLogo} alt="Borough" className="h-6" />
        </Link>
        <div>
          {user ? (
            <UserMenu />
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;