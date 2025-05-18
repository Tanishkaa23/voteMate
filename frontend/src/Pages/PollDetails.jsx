// src/Pages/PollDetails.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient'; // Ensure this path is correct
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../index.css'; // Ensure this path is correct
import { FiSend, FiLoader, FiAlertCircle, FiChevronLeft, FiCheck, FiUser, FiCalendar } from 'react-icons/fi';

const PollDetails = () => {
  const { id: pollIdFromParams } = useParams(); // Renamed to avoid conflict if 'id' is used elsewhere
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteError, setVoteError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    console.log("PollDetails: Mounting or pollIdFromParams changed. Fetching poll:", pollIdFromParams); // DEBUG
    setLoading(true);
    setError(null);
    setVoteError(null);
    setSelectedOptionIndex(null);
    setHasVoted(false);

    if (!pollIdFromParams) {
        console.error("PollDetails: No poll ID found in params.");
        setError("Poll ID is missing.");
        setLoading(false);
        return;
    }

    const fetchPollData = async () => {
        try {
            const endpointPath = `/api/poll/${pollIdFromParams}`;
            console.log(`PollDetails: Attempting to GET: ${apiClient.defaults.baseURL}${endpointPath}`); // DEBUG
            
            const res = await apiClient.get(endpointPath);
            
            if (res.data && res.data._id) {
                console.log("PollDetails: Poll data fetched successfully:", res.data.question); // DEBUG
                setPoll(res.data);
            } else {
                console.error("PollDetails: API response for poll details is not in expected format:", res.data);
                setError("Poll data is not in the expected format.");
                setPoll(null);
            }
        } catch (err) {
            console.error(`PollDetails: Error fetching poll details for ID ${pollIdFromParams}:`, err.response || err.message); // DEBUG
            if (err.response && err.response.status === 404) {
                setError("Poll not found. It might have been deleted or the link is incorrect.");
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || "Failed to fetch poll details.");
            }
            setPoll(null);
        } finally {
            setLoading(false);
        }
    };

    fetchPollData();
  }, [pollIdFromParams]);

  const handleVote = async () => {
    if (selectedOptionIndex === null) {
      setVoteError('Please select an option to vote.');
      return;
    }
    setVoteError(null);
    setIsSubmitting(true);
    console.log(`PollDetails: Initiating vote for poll ID: ${pollIdFromParams}, option index: ${selectedOptionIndex}`); // DEBUG

    try {
      const endpointPath = `/api/poll/${pollIdFromParams}/vote`;
      console.log(`PollDetails: Attempting to POST to: ${apiClient.defaults.baseURL}${endpointPath}`); // DEBUG
      
      const res = await apiClient.post(endpointPath, {
        optionIndex: selectedOptionIndex
        // If your backend *requires* pollId in the body even with it in params:
        // pollId: pollIdFromParams, 
      });

      console.log("PollDetails: Vote submission response:", res.data); // DEBUG
      setHasVoted(true);
      if (res.data && res.data.poll) {
          setPoll(res.data.poll);
      } else {
          console.warn("PollDetails: Vote successful, but no updated poll data received. Incrementing client-side.");
          const updatedPoll = { ...poll };
          if (updatedPoll.votes && typeof updatedPoll.votes[selectedOptionIndex] === 'number') {
              updatedPoll.votes[selectedOptionIndex]++;
          }
          setPoll(updatedPoll);
      }
      
      setTimeout(() => {
          navigate('/polls');
      }, 2500);

    } catch (err) {
      console.error("PollDetails: Error submitting vote:", err.response || err.message); // DEBUG
      // Log the actual URL that was called if available from error object
      if (err.request && err.request.responseURL) {
        console.error("PollDetails: Actual URL called for vote:", err.request.responseURL);
      }
      if (err.response?.data?.message === "You've already voted on this poll") {
          setVoteError("You have already cast your vote on this poll.");
      } else {
          setVoteError(err.response?.data?.message || err.response?.data?.error || "Error submitting vote. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const SkeletonPollDetails = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-3/4 mb-6"></div>
      <div className="space-y-4 mb-8">
        <div className="h-12 bg-slate-200 rounded-lg"></div>
        <div className="h-12 bg-slate-200 rounded-lg"></div>
        <div className="h-12 bg-slate-200 rounded-lg w-5/6"></div>
      </div>
      <div className="h-12 bg-slate-300 rounded-lg w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2 mt-6 mx-auto"></div>
    </div>
  );

  if (loading) {
    return (
        <div className="bg-slate-100 min-h-screen py-8 md:py-12 flex items-center justify-center">
            <div className="max-w-xl w-full mx-auto p-6 md:p-8 bg-white rounded-xl shadow-2xl">
                <SkeletonPollDetails />
            </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <FiAlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Error Loading Poll</h2>
        <p className="text-red-600">{error}</p>
        <Link
          to="/polls"
          className="mt-6 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition flex items-center"
        >
          <FiChevronLeft className="mr-1" /> Back to Polls
        </Link>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-xl text-gray-600">Poll data could not be loaded or poll does not exist.</p>
        <Link to="/polls" className="mt-4 text-sky-600 hover:text-sky-700">Go back to polls</Link>
      </div>
    );
  }

  if (!Array.isArray(poll.options) || !Array.isArray(poll.votes)) {
    return (
        <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <FiAlertCircle className="text-orange-500 w-16 h-16 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Poll Data Incomplete</h2>
            <p className="text-orange-600">The poll data seems to be corrupted. Please try another poll.</p>
            <Link
            to="/polls"
            className="mt-6 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition flex items-center"
            >
            <FiChevronLeft className="mr-1" /> Back to Polls
            </Link>
        </div>
    );
  }
  
  if (hasVoted) {
    const totalVotes = poll.votes.reduce((sum, v) => sum + (v || 0), 0);
    return (
      <div className="bg-slate-100 min-h-screen py-8 md:py-12 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto p-6 md:p-8 bg-white rounded-xl shadow-2xl text-center">
          <FiCheck className="text-emerald-500 w-16 h-16 mb-4 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Thank You for Voting!</h2>
          <p className="text-gray-600 mb-6">Your vote on "{poll.question}" has been recorded.</p>
          <div className="space-y-2 text-left mb-6">
            {poll.options.map((opt, i) => {
                const currentVoteCount = poll.votes[i] !== undefined ? poll.votes[i] : 0;
                const percentage = totalVotes > 0 ? ((currentVoteCount / totalVotes) * 100) : 0;
                return (
                  <div key={i} className="p-3 bg-slate-100 rounded-md">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">{opt}</span>
                      <span className="text-gray-600">
                        {currentVoteCount} vote{currentVoteCount !== 1 ? 's' : ''}
                        {totalVotes > 0 && ` (${percentage.toFixed(0)}%)`}
                      </span>
                    </div>
                    {totalVotes > 0 && (
                        <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500" style={{width: `${percentage}%`}}></div>
                        </div>
                    )}
                  </div>
                );
            })}
          </div>
          <p className="text-sm text-gray-500">You will be redirected shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-8 md:py-12">
      <div className="max-w-xl w-full mx-auto px-4">
         <Link
            to="/polls"
            className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700 mb-6 group"
          >
            <FiChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to All Polls
          </Link>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 leading-tight">{poll.question}</h2>
            {poll.createdBy && (
                <div className="text-xs text-gray-500 mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center">
                        <FiUser className="mr-1.5 text-slate-400"/> By: <strong className="ml-1 text-gray-600">{poll.createdBy.username || 'Anonymous'}</strong>
                    </span>
                    <span className="flex items-center">
                        <FiCalendar className="mr-1.5 text-slate-400"/> Created: <strong className="ml-1 text-gray-600">{new Date(poll.createdAt || Date.now()).toLocaleDateString()}</strong>
                    </span>
                </div>
            )}

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4 mb-8">
                {poll.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`block p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out
                               ${selectedOptionIndex === i ? 'bg-sky-100 border-sky-500 ring-2 ring-sky-500 shadow-md' : 'bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-sky-50'}`}
                  >
                    <input
                      type="radio"
                      name="pollOption"
                      value={i}
                      checked={selectedOptionIndex === i}
                      onChange={() => {setSelectedOptionIndex(i); if(voteError) setVoteError(null);}}
                      className="sr-only"
                    />
                    <span className={`text-base font-medium ${selectedOptionIndex === i ? 'text-sky-700' : 'text-gray-700'}`}>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>

              {voteError && (
                  <p className="my-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-md flex items-center">
                    <FiAlertCircle className="inline mr-2 h-5 w-5" />
                    {voteError}
                  </p>
              )}

              <button
                type="button"
                onClick={handleVote}
                disabled={isSubmitting || selectedOptionIndex === null || voteError === "You have already cast your vote on this poll."}
                className="w-full flex items-center justify-center bg-teal-500 text-white px-6 py-3.5 text-base font-medium rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-500 transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin mr-2 h-5 w-5" /> Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2 h-5 w-5" /> Submit Vote
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetails;