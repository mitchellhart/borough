import { useState, useRef, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import BoroughLogo from '../assets/Borough-logo.svg';
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
      await signOut(auth);
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const UserMenu = () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 focus:outline-none"
        >
          <span className="text-gray-600">
            {user.email.charAt(0).toUpperCase()}
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