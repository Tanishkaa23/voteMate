// src/Pages/Home.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient'; // Ensure path is correct
import '../index.css'; 
import { FiBarChart2, FiUser, FiHelpCircle, FiFileText, FiLoader } from 'react-icons/fi';

const Home = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Home.jsx: Mounting. Fetching all polls.");
    setLoading(true);
    setError(null);
    
    apiClient.get('/api/polls')
      .then((res) => {
        if (res.data && Array.isArray(res.data.polls)) {
          console.log("Home.jsx: Polls fetched successfully.");
          setPolls(res.data.polls);
        } else {
          console.error("Home.jsx: API response for /api/polls is not in expected format:", res.data);
          setPolls([]);
          setError("Failed to load polls: Unexpected data format from server.");
        }
      })
      .catch((err) => {
        console.error("Home.jsx: Error fetching polls for Home page:", err.response || err.message);
        if (err.config && err.config.url) {
            console.error("Home.jsx: Actual URL called:", err.config.url);
        }
        setError(err.response?.data?.message || err.response?.data?.error || "Network Error: Could not fetch polls.");
        setPolls([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // **** SKELETON CARD DEFINITION ****
  const SkeletonCard = () => (
    <div className="bg-white shadow-xl rounded-xl p-6 mb-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div> {/* Question placeholder */}
      <div className="space-y-3">
        <div className="h-10 bg-slate-200 rounded"></div> {/* Option placeholder */}
        <div className="h-10 bg-slate-200 rounded"></div> {/* Option placeholder */}
        <div className="h-10 bg-slate-200 rounded w-5/6"></div> {/* Option placeholder */}
      </div>
      <div className="h-4 bg-slate-200 rounded w-1/2 mt-5 pt-2 border-t border-gray-200"></div> {/* Creator placeholder */}
      <div className="h-4 bg-slate-200 rounded w-1/3 mt-2"></div> {/* Total votes placeholder */}
    </div>
  );
  // **** END OF SKELETON CARD DEFINITION ****

  if (loading) {
    return (
      <div className="bg-slate-100 min-h-screen py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-sky-700">
            Discover Active Polls
          </h2>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <FiHelpCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Something went wrong.</h2>
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
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <FiFileText className="text-sky-500 w-20 h-20 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Polls Yet!</h2>
        <p className="text-gray-500">It looks like there are no active polls at the moment.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-100 min-h-screen py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-sky-700">
          Discover Active Polls
        </h2>
        <div className="space-y-8">
          {polls.map((poll) => {
            // ... (tumhara poll mapping JSX waise hi) ...
            if (!poll || !poll._id || !Array.isArray(poll.options) || !Array.isArray(poll.votes)) {
              console.warn("Skipping rendering of malformed poll object:", poll);
              return null;
            }

            const totalVotesInPoll = poll.votes.reduce((sum, current) => sum + (current || 0), 0);
            const maxVotes = totalVotesInPoll > 0 ? Math.max(...poll.votes.map(v => v || 0)) : 0;
            const displayVotes = poll.options.map((_, i) => poll.votes[i] || 0);

            return (
              <div key={poll._id} className="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="p-6">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-5 text-gray-800 leading-tight">{poll.question}</h3>
                  <div className="space-y-3">
                    {poll.options.map((opt, i) => {
                      const percentage = totalVotesInPoll > 0 ? (displayVotes[i] / totalVotesInPoll) * 100 : 0;
                      const isWinning = displayVotes[i] === maxVotes && maxVotes > 0;
                      return (
                        <div key={i} className="relative p-3 rounded-lg border border-slate-200 overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full rounded-md transition-all duration-500 ease-out ${
                              isWinning ? 'bg-emerald-400 opacity-80' : 'bg-sky-300 opacity-60'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <div className="relative flex justify-between items-center">
                            <span className={`font-medium break-all ${isWinning ? 'text-emerald-800' : 'text-gray-700'}`}>
                              {opt}
                            </span>
                            <div className="flex items-center ml-2 flex-shrink-0">
                              {isWinning && <FiBarChart2 className="text-emerald-600 mr-1" />}
                              <span className={`text-sm font-semibold ${isWinning ? 'text-emerald-800' : 'text-gray-600'}`}>
                                {displayVotes[i]} vote{displayVotes[i] !== 1 ? 's' : ''}
                                <span className="ml-1 text-xs opacity-75">({percentage.toFixed(0)}%)</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-gray-500 flex flex-wrap justify-between items-center">
                  {poll.createdBy && poll.createdBy.username ? (
                    <span className="flex items-center mr-4 mb-1 sm:mb-0">
                      <FiUser className="mr-1 text-slate-400"/> Created by: <strong className="ml-1 text-gray-600">{poll.createdBy.username}</strong>
                    </span>
                  ) : (
                     <span className="flex items-center mr-4 mb-1 sm:mb-0">
                      <FiUser className="mr-1 text-slate-400"/> Anonymous Creator
                    </span>
                  )}
                  <span className="flex items-center">
                    <FiBarChart2 className="mr-1 text-slate-400"/> Total votes: <strong className="ml-1 text-gray-600">{totalVotesInPoll}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Home;