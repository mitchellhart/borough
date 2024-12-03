import { getAuth, signOut } from 'firebase/auth';
import BoroughLogo from '../assets/Borough-logo.svg';
import { useLocation } from 'react-router-dom';

function NavBar({ onLoginClick, user }) {
  const location = useLocation();
  const isIndexPage = location.pathname === '/';

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Render different styles for index page
  if (isIndexPage) {
    return (
      <div className="absolute top-16 right-40">
        {user ? (
          <div className="flex items-center gap-4">
            <span>{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="bg-blue-500 text-white px-4 py-2 rounded"
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
        <img src={BoroughLogo} alt="Borough" className="h-6" />
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span>{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
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