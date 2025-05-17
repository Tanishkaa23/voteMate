import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import '../index.css'; // Ensure this path is correct
import { FiSend, FiLoader, FiAlertCircle, FiChevronLeft, FiCheck, FiUser, FiCalendar } from 'react-icons/fi'; // Icons

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteError, setVoteError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false); // New state to track if user has just voted

  useEffect(() => {
    setLoading(true);
    setError(null);
    setVoteError(null); // Reset vote error on new poll load
    setSelectedOptionIndex(null); // Reset selected option
    setHasVoted(false); // Reset voted status

    axios.get(`http://localhost:3000/api/poll/${id}`, { withCredentials: true })
      .then(res => {
        if (res.data && res.data._id) {
          setPoll(res.data);
          // Check if the user has already voted on this poll (if backend provides this info)
          // For now, we'll assume this isn't directly provided on GET,
          // and a 400 error on POST /vote indicates "already voted".
        } else {
          setError("Poll data is not in the expected format.");
          setPoll(null);
        }
      })
      .catch(err => {
        console.error(`Error fetching poll details for ID ${id}:`, err);
        if (err.response && err.response.status === 404) {
            setError("Poll not found. It might have been deleted or the link is incorrect.");
        } else {
            setError(err.response?.data?.message || "Failed to fetch poll details.");
        }
        setPoll(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleVote = () => {
    if (selectedOptionIndex === null) {
      setVoteError('Please select an option to vote.');
      return;
    }
    setVoteError(null);
    setIsSubmitting(true);

    axios.post(`http://localhost:3000/api/poll/${id}/vote`,
               { pollId: id, optionIndex: selectedOptionIndex },
               { withCredentials: true })
      .then(res => {
        setHasVoted(true); // Mark as voted
        setPoll(res.data.poll); // Update poll data with new vote counts
        // Optionally, show a success message for a few seconds before navigating
        // or just navigate directly
        setTimeout(() => {
            navigate('/polls'); // Or '/dashboard' or even refresh current page to show results
        }, 2000); // Navigate after 2 seconds
      })
      .catch(err => {
        console.error("Error submitting vote:", err);
        if (err.response && err.response.data && err.response.data.message === "You've already voted on this poll") {
            setVoteError("You have already cast your vote on this poll.");
            // Optionally, disable voting options if already voted
        } else {
            setVoteError(err.response?.data?.message || "Error submitting vote. Please try again.");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Skeleton Loader for Poll Details
  const SkeletonPollDetails = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-3/4 mb-6"></div> {/* Question */}
      <div className="space-y-4 mb-8">
        <div className="h-12 bg-slate-200 rounded-lg"></div> {/* Option 1 */}
        <div className="h-12 bg-slate-200 rounded-lg"></div> {/* Option 2 */}
        <div className="h-12 bg-slate-200 rounded-lg w-5/6"></div> {/* Option 3 */}
      </div>
      <div className="h-12 bg-slate-300 rounded-lg w-full"></div> {/* Submit Button */}
      <div className="h-4 bg-slate-200 rounded w-1/2 mt-6 mx-auto"></div> {/* Creator info placeholder */}
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
    // This case should ideally be covered by the error state if API fails or returns no poll
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-xl text-gray-600">Poll not found.</p>
        <Link to="/polls" className="mt-4 text-sky-600 hover:text-sky-700">Go back to polls</Link>
      </div>
    );
  }

  if (!Array.isArray(poll.options)) {
    return <div className="text-center mt-10 p-6 text-red-600">Error: Poll data is corrupted (missing options).</div>;
  }

  // After successful vote, show a thank you message and results briefly
  if (hasVoted) {
    const totalVotes = poll.votes.reduce((sum, v) => sum + v, 0);
    return (
      <div className="bg-slate-100 min-h-screen py-8 md:py-12 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto p-6 md:p-8 bg-white rounded-xl shadow-2xl text-center">
          <FiCheck className="text-emerald-500 w-16 h-16 mb-4 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Thank You for Voting!</h2>
          <p className="text-gray-600 mb-6">Your vote on "{poll.question}" has been recorded.</p>
          
          {/* Display simple results after voting */}
          <div className="space-y-2 text-left mb-6">
            {poll.options.map((opt, i) => (
              <div key={i} className="p-3 bg-slate-100 rounded-md">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{opt}</span>
                  <span className="text-gray-600">
                    {poll.votes[i]} vote{poll.votes[i] !== 1 ? 's' : ''}
                    {totalVotes > 0 && ` (${((poll.votes[i] / totalVotes) * 100).toFixed(0)}%)`}
                  </span>
                </div>
                 {/* Optional: Simple progress bar */}
                {totalVotes > 0 && (
                    <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500" style={{width: `${(poll.votes[i]/totalVotes)*100}%`}}></div>
                    </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">You will be redirected shortly...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-slate-100 min-h-screen py-8 md:py-12">
      <div className="max-w-xl w-full mx-auto p-4"> {/* Give some outer padding to the container */}
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
                <div className="text-xs text-gray-500 mb-6 flex flex-wrap items-center">
                    <span className="flex items-center mr-3">
                        <FiUser className="mr-1.5 text-slate-400"/> By: <strong className="ml-1 text-gray-600">{poll.createdBy.username || 'Anonymous'}</strong>
                    </span>
                    <span className="flex items-center">
                        <FiCalendar className="mr-1.5 text-slate-400"/> Created: <strong className="ml-1 text-gray-600">{new Date(poll.createdAt).toLocaleDateString()}</strong>
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
                      className="sr-only" // Hide actual radio, style label instead
                    />
                    <span className={`text-base font-medium ${selectedOptionIndex === i ? 'text-sky-700' : 'text-gray-700'}`}>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>

              {voteError && (
                  <p className="my-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-md">
                    <FiAlertCircle className="inline mr-2 h-5 w-5" />
                    {voteError}
                  </p>
              )}

              <button
                type="button"
                onClick={handleVote}
                disabled={isSubmitting || selectedOptionIndex === null || voteError === "You have already cast your vote on this poll."} // Disable if already voted
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