// frontend/src/Pages/Register.jsx
import React, { useState, useEffect } from 'react';
// import Cookies from 'js-cookie'; // <<--- Iski zaroorat nahi hai cookie set karne ke liye yahan
import apiClient from '../services/apiClient'; // Ensure path is correct
import { useNavigate, Link } from 'react-router-dom';
import { FiUserPlus, FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({}); // For specific field errors (from your previous version)
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showRegisterSuccessToast, setShowRegisterSuccessToast] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    if (error) setError('');
    if (showRegisterSuccessToast) setShowRegisterSuccessToast(false);
  };

  const validateForm = () => { // Assuming you have this validation function
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters long.";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setFormErrors({});
    setShowRegisterSuccessToast(false);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // apiClient already has withCredentials: true
      const res = await apiClient.post('/user/register', { ...formData, role: 'user' });

      if (res.data.user && res.data.token) { // Backend sets HttpOnly:false cookie AND returns token
        
        // **** REMOVED Cookies.set() FROM HERE ****
        // Backend is responsible for setting the cookie via Set-Cookie header.
        // js-cookie in NavBar will read the cookie set by the backend.
        
        window.dispatchEvent(new Event('authChange')); // Notify NavBar to re-check cookie
        
        setShowRegisterSuccessToast(true);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } else {
        setError(res.data.message || 'Registration failed. Unexpected response from server.');
      }
    } catch (err) {
      console.error("Registration error:", err.response || err.message);
      if (err.response && err.response.data) {
        setError(err.response.data.message || err.response.data.error || 'An error occurred during registration.');
      } else if (err.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (showRegisterSuccessToast) {
      timer = setTimeout(() => {
        setShowRegisterSuccessToast(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showRegisterSuccessToast]);

  // JSX remains the same as your provided version with formErrors
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8 relative">
      {showRegisterSuccessToast && (
        <div className="fixed top-5 right-5 md:top-8 md:right-8 bg-emerald-500 text-white px-5 py-3 rounded-lg shadow-xl z-[100] flex items-center animate-slideDownFadeIn">
          <FiCheckCircle className="h-6 w-6 mr-3" />
          Registered successfully! Redirecting...
        </div>
      )}
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <h1 className="text-sky-700 text-4xl font-bold tracking-tight hover:opacity-90 transition-opacity">
              vote<span className="text-teal-500">Mate</span>
            </h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Or{' '} <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">sign in to your existing account</Link></p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 shadow-xl rounded-xl">
          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
              <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiUser className="h-5 w-5 text-gray-400" /></div>
                <input id="username" name="username" type="text" autoComplete="username" required value={formData.username} onChange={handleChange} className={`appearance-none relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow ${formErrors.username ? 'border-red-500' : 'border-gray-300'}`} placeholder="Username" />
              </div>
              {formErrors.username && <p className="mt-1 text-xs text-red-600">{formErrors.username}</p>}
            </div>

            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiMail className="h-5 w-5 text-gray-400" /></div>
                <input id="email-address" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={`appearance-none relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="Email address" />
              </div>
              {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-gray-400" /></div>
                <input id="password" name="password" type="password" autoComplete="new-password" required value={formData.password} onChange={handleChange} className={`appearance-none relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="Password (min. 6 characters)" />
              </div>
              {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading || showRegisterSuccessToast} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 transition-colors">
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading || showRegisterSuccessToast ? (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : (<FiUserPlus className="h-5 w-5 text-sky-500 group-hover:text-sky-400" />)}
              </span>
              {loading ? 'Creating Account...' : (showRegisterSuccessToast ? 'Success!' : 'Create Account')}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">By creating an account, you agree to our <br/><a href="/terms" className="font-medium text-sky-600 hover:text-sky-500">Terms of Service</a> and <a href="/privacy" className="font-medium text-sky-600 hover:text-sky-500">Privacy Policy</a>.</p>
      </div>
    </div>
  );
};
export default Register;