// frontend/src/Pages/Login.jsx
import React, { useState, useEffect } from 'react';
// import Cookies from 'js-cookie'; // <<--- Iski zaroorat nahi hai cookie set karne ke liye yahan
import apiClient from '../services/apiClient';
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
      const res = await apiClient.post('/user/login', formData); // apiClient handles withCredentials

      if (res.data.user && res.data.token) { // Backend sends user and token, AND sets HttpOnly:false cookie
        
        // **** REMOVED Cookies.set() FROM HERE ****
        // Backend is responsible for setting the cookie via Set-Cookie header.
        // js-cookie in NavBar will read the cookie set by the backend.
        
        window.dispatchEvent(new Event('authChange')); // Notify NavBar to re-check cookie
        
        setShowLoginSuccessToast(true);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000); 

      } else {
        // This case might be if backend logic changes and doesn't send user/token on success
        setError(res.data.message || res.data.error || 'Login failed. Unexpected response from server.');
      }
    } catch (err) {
      console.error("Login error:", err.response || err.message); // Log the full error
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials or try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (showLoginSuccessToast) {
      timer = setTimeout(() => {
        setShowLoginSuccessToast(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showLoginSuccessToast]);

  // JSX remains the same
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8 relative">
      {showLoginSuccessToast && (
        <div className="fixed top-5 right-5 md:top-8 md:right-8 bg-emerald-500 text-white px-5 py-3 rounded-lg shadow-xl z-[100] flex items-center animate-slideDownFadeIn">
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
              <FiAlertCircle className="h-5 w-5 mr-2" aria-hidden="true" />
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiMail className="h-5 w-5 text-gray-400" /></div>
                <input id="email-address" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow" placeholder="Email address" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-gray-400" /></div>
                <input id="password" name="password" type="password" autoComplete="current-password" required value={formData.password} onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow" placeholder="Password" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>
            <div className="text-sm"><a href="#" className="font-medium text-sky-600 hover:text-sky-500">Forgot your password?</a></div>
          </div>
          <div>
            <button type="submit" disabled={loading || showLoginSuccessToast} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 transition-colors">
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading || showLoginSuccessToast ? (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : (<FiLogIn className="h-5 w-5 text-sky-500 group-hover:text-sky-400" />)}
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