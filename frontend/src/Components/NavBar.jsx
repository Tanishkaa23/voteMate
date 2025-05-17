// frontend/src/Components/NavBar.jsx
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiMenu, FiX, FiLogOut, FiAlertTriangle } from 'react-icons/fi'; // Added FiLogOut, FiAlertTriangle

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get('token'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // **** NEW STATE FOR LOGOUT CONFIRMATION MODAL ****
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!Cookies.get('token'));
    };
    handleAuthChange();
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // **** MODIFIED LOGOUT LOGIC ****
  const handleLogoutClick = () => {
    // Step 1: Show the confirmation modal
    setShowLogoutConfirm(true);
  };

  const confirmActualLogout = async () => {
    // Step 2: User confirmed, proceed with actual logout
    setShowLogoutConfirm(false); // Close the modal
    try {
      await axios.post('http://localhost:3000/user/logout', {}, { withCredentials: true });
      Cookies.remove('token');
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    } catch (err) {
      console.error("Logout error", err);
      alert('Logout failed. Please try again.');
    }
  };

  const cancelLogout = () => {
    // Step 3: User cancelled
    setShowLogoutConfirm(false); // Close the modal
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinkBaseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
  const activeNavLinkClasses = "bg-sky-700 text-white";
  const inactiveNavLinkClasses = "text-sky-100 hover:bg-sky-600 hover:text-white";

  const NavLinksContent = ({ isMobile = false }) => (
    <>
      <Link
        to="/"
        className={`${navLinkBaseClasses} ${location.pathname === '/' ? activeNavLinkClasses : inactiveNavLinkClasses} ${isMobile ? 'block text-center py-2' : ''}`}
      >
        Home
      </Link>
      {isLoggedIn && (
        <Link
          to="/polls"
          className={`${navLinkBaseClasses} ${location.pathname === '/polls' || location.pathname.startsWith('/polls/') ? activeNavLinkClasses : inactiveNavLinkClasses} ${isMobile ? 'block text-center py-2' : ''}`}
        >
          Polls
        </Link>
      )}
      {isLoggedIn ? (
        <>
          <Link
            to="/dashboard"
            className={`${navLinkBaseClasses} ${location.pathname === '/dashboard' ? activeNavLinkClasses : inactiveNavLinkClasses} ${isMobile ? 'block text-center py-2' : ''}`}
          >
            Dashboard
          </Link>
          {/* Use handleLogoutClick to show modal first */}
          <button
            onClick={handleLogoutClick} // <<<< CHANGED FROM handleLogout
            className={`
              ${navLinkBaseClasses} 
              ${inactiveNavLinkClasses} 
              bg-red-500 hover:bg-red-600 text-white 
              ${isMobile ? 'w-full text-center block mt-1 py-2.5' : 'py-2'}
            `}
          >
            <FiLogOut className={`inline mr-1 ${isMobile ? 'hidden' : ''}`} /> {/* Optional icon */}
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className={`${navLinkBaseClasses} ${isMobile ? 'w-full text-center block py-2.5' : 'py-2'} bg-teal-500 hover:bg-teal-600 text-white`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`${navLinkBaseClasses} ${isMobile ? 'w-full text-center block mt-1 py-2.5' : 'py-2 ml-2 md:ml-0 mt-1 md:mt-0'} bg-emerald-500 hover:bg-emerald-600 text-white`}
          >
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <> {/* Use Fragment shorthand */}
      <nav className="bg-sky-800 shadow-md sticky top-0 z-50">
        {/* ... Your existing Navbar structure ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
                <Link to="/" className="text-white text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
                vote<span className="text-teal-400">Mate</span>
                </Link>
            </div>

            <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                <NavLinksContent />
                </div>
            </div>

            <div className="md:hidden flex items-center">
                <button
                onClick={toggleMobileMenu} type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-sky-200 hover:text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}
                >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
                </button>
            </div>
            </div>
        </div>

        <div
            className={`md:hidden transition-all ease-in-out duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100 shadow-lg' : 'max-h-0 opacity-0'}`}
            id="mobile-menu"
        >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-sky-800">
            <NavLinksContent isMobile={true} />
            </div>
        </div>
      </nav>

      {/* **** LOGOUT CONFIRMATION MODAL **** */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"> {/* Increased z-index */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all scale-100 opacity-100"> {/* Added transform classes for potential animation */}
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900" id="modal-title">
                        Confirm Logout
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                        Are you sure you want to log out of your account?
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={confirmActualLogout}
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
              >
                Yes, Logout
              </button>
              <button
                onClick={cancelLogout}
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;