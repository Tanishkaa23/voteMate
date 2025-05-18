// src/Pages/Polls.jsx
import React, { useEffect, useState } from 'react';
// import axios from 'axios'; // Remove direct axios import
import apiClient from '../services/apiClient'; // <<--- IMPORT apiClient (adjust path if needed)
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure this path is correct
import { FiLoader, FiAlertCircle, FiFileText } from 'react-icons/fi'; // Example icons for states

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Use apiClient.get()
    // If this is a public endpoint and doesn't need credentials,
    // apiClient will still work fine (it includes withCredentials by default,
    // but server will ignore it if route is not protected).
    // Alternatively, for strictly public endpoints, you could use a separate axios instance
    // or a regular axios.get() without withCredentials. For consistency, using apiClient is okay.
    apiClient.get('/api/polls') // Endpoint path, baseURL is from apiClient
      .then(res => {
        if (res.data && Array.isArray(res.data.polls)) { // Assuming backend sends { polls: [...] }
          setPolls(res.data.polls);
        } else {
          console.error("API response for /api/polls (Polls page) is not in expected format:", res.data);
          setPolls([]);
          setError("Failed to load polls: Unexpected data format from server.");
        }
      })
      .catch(err => {
        console.error("Error fetching polls for Polls page:", err);
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to fetch polls. Please try again later.");
        setPolls([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-6 bg-slate-50">
        <FiLoader className="animate-spin h-12 w-12 text-sky-600 mb-4" />
        <p className="text-lg text-gray-700">Loading available polls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-6 bg-slate-50">
        <FiAlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Could Not Load Polls</h2>
        <p className="text-red-600">{error}</p>
         <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-6 bg-slate-50">
        <FiFileText className="h-12 w-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Polls Available</h2>
        <p className="text-gray-500">It seems there are no polls to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-8 md:py-12"> {/* Added page background */}
      <div className="max-w-3xl mx-auto px-4"> {/* Consistent max-width */}
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-sky-700">
          Explore Active Polls
        </h2>
        <div className="space-y-6"> {/* Increased spacing */}
          {polls.map(poll => {
            if (!poll || !poll._id || !poll.question) {
              console.warn("Skipping rendering of malformed poll object in Polls list:", poll);
              return null;
            }
            return (
              <div 
                key={poll._id} 
                className="bg-white shadow-xl rounded-xl p-5 md:p-6 transition-all duration-300 hover:shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex-grow">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 break-words"> {/* Changed from break-all to break-words */}
                    {poll.question}
                  </h3>
                  {poll.createdBy?.username && (
                    <p className="text-xs text-slate-500 mt-1">
                      Created by: {poll.createdBy.username}
                    </p>
                  )}
                </div>
                <Link
                  to={`/polls/${poll._id}`}
                  className="bg-teal-500 text-white px-5 py-2.5 rounded-lg hover:bg-teal-600 transition-colors duration-200 font-medium text-sm self-start sm:self-center whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  View & Vote
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Polls;