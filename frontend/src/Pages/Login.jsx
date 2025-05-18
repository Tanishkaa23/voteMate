// frontend/src/Pages/Login.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Ensure this is imported
import apiClient from '../services/apiClient'; // Ensure this path is correct to your apiClient
import { useNavigate, Link } from 'react-router-dom';
import { FiLogIn, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showLoginSuccessToast, setShowLoginSuccessToast] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (showLoginSuccessToast) setShowLoginSuccessToast(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowLoginSuccessToast(false);

    if (!formData.email.trim() || !formData.password.trim()) {
        setError("Email and password are required.");
        setLoading(false);
        return;
    }

    try {
      // apiClient already has withCredentials: true set in its configuration
      const res = await apiClient.post('/user/login', formData);

      if (res.data.user && res.data.token) {
        // Set the cookie client-side using js-cookie
        // This cookie will be for the frontend's domain (e.g., myvotemate.vercel.app)
        // NavBar will read this cookie.
        Cookies.set('token', res.data.token, { 
            expires: 1, // 1 day
            path: '/',  // Cookie available for all paths on the current domain
            // Dynamically set 'secure' flag: true for HTTPS, false for HTTP
            secure: window.location.protocol === 'https:', 
            // 'Lax' is a good default for cookies set by first-party JavaScript
            sameSite: 'Lax' 
        });
        console.log("[Login.jsx] Client-side cookie 'token' set by js-cookie. Value:", Cookies.get('token'));
        
        window.dispatchEvent(new Event('authChange')); // Notify NavBar to re-check and update
        
        setShowLoginSuccessToast(true);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000); // Navigate after 2 seconds

      } else {
        // Handle cases where backend might return 2xx but no user/token as expected
        setError(res.data.message || res.data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Login error details:", err.response || err.message || err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials or try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to hide the toast after 3 seconds if it's shown
  useEffect(() => {
    let timer;
    if (showLoginSuccessToast) {
      timer = setTimeout(() => {
        setShowLoginSuccessToast(false);
      }, 3000); // Toast visible for 3 seconds
    }
    return () => clearTimeout(timer); // Cleanup timer on component unmount or if toast changes
  }, [showLoginSuccessToast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Login Success Toast */}
      {showLoginSuccessToast && (
        <div 
          className="fixed top-5 right-5 md:top-8 md:right-8 bg-emerald-500 text-white px-5 py-3 rounded-lg shadow-xl z-[100] flex items-center animate-slideDownFadeIn"
          // Ensure 'animate-slideDownFadeIn' CSS class is defined in your global CSS
        >
          <FiCheckCircle className="h-6 w-6 mr-3" />
          Logged in successfully! Redirecting...
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
             <h1 className="text-sky-700 text-4xl font-bold tracking-tight hover:opacity-90 transition-opacity">
              vote<span className="text-teal-500">Mate</span>
            </h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-sky-600 hover:text-sky-500">
              create a new account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 shadow-xl rounded-xl">
          {/* General error display from backend or validation */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
              <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input fields */}
          <div className="rounded-md shadow-sm -space-y-px"> {/* Grouping for styling */}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-sky-600 hover:text-sky-500"> {/* TODO: Implement forgot password */}
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || showLoginSuccessToast}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed transition-colors"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading || showLoginSuccessToast ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                  <FiLogIn className="h-5 w-5 text-sky-500 group-hover:text-sky-400" aria-hidden="true" />
                )}
              </span>
              {loading ? 'Signing In...' : (showLoginSuccessToast ? 'Success!' : 'Sign In')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;