import { useState, useRef, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import BoroLogo from '../assets/boro-logo.svg';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

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
      console.log('Starting logout process...');
      await signOut(auth);
      console.log('Successfully signed out from Firebase');
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const UserMenu = ({ user }) => (
    <div className="flex items-center">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-300 focus:outline-none"
          >
            <span className="text-gray-100">
              {user && user.email ? user.email.charAt(0).toUpperCase() : ''}
            </span>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            className="min-w-[200px] bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
            sideOffset={5}
            align="end"
          >
            <DropdownMenu.Item asChild>
              <Link
                to="/account"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 outline-none cursor-pointer"
              >
                Account
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-[1px] bg-gray-200 m-1" />
            
            <DropdownMenu.Item 
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 outline-none cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );

  const renderUserSection = () => {
    if (user) {
      return <UserMenu user={user} />;
    } else {
      return (
        <button
          onClick={onLoginClick}
          className="text-white text-base font-nohemi-medium px-4 py-2 rounded-2xl"
          style={{ color: '#395E44', border: '2px solid #395E44' }}
        >
          Login
        </button>
      );
    }
  };

  // Render different styles for index page
  if (isIndexPage) {
    return (
      <div className="w-full px-10 pt-4 flex justify-end items-center" style={{ backgroundColor: '#E6E2DD' }}>
        <div className="flex-grow">
          {user && (
            <Link to="/">
              <img src={BoroLogo} alt="Boro logo" className="h-6" />
            </Link>
          )}
        </div>
        {renderUserSection()}
      </div>
    );
  }

  // Regular navbar for other pages
  return (
    <nav className="p-8" style={{ backgroundColor: '#E6E2DD' }}>
      <div className="flex justify-between items-center">
        {user && (
          <Link to="/">
            <img src={BoroLogo} alt="Boro logo" className="h-6" />
          </Link>
        )}
        <div className="pr-4">
          {renderUserSection()}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;