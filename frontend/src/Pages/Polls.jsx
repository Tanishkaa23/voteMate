import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure this path is correct

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Polls.jsx
// ...
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('http://localhost:3000/api/polls', { withCredentials: true })
      .then(res => {
        // FIX: Change res.data.poll to res.data.polls
        if (res.data && Array.isArray(res.data.polls)) {
          setPolls(res.data.polls);
        } else {
          console.error("API response for /api/polls (Polls page) is not in expected format:", res.data);
          setPolls([]);
          setError("Failed to load polls: Unexpected data format from server.");
        }
      })
      .catch(err => {
        console.error("Error fetching polls for Polls page:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch polls.");
        setPolls([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
// ...
  if (loading) {
    return <div className="text-center mt-10 p-6">Loading polls...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 p-6 text-red-600">Error: {error}</div>;
  }

  if (polls.length === 0) {
    return <div className="text-center mt-10 p-6">No polls available to vote on.</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-sky-800">Available Polls</h2>
      <div className="space-y-4">
        {polls.map(poll => {
          if (!poll || !poll._id || !poll.question) {
            console.warn("Skipping rendering of malformed poll object in Polls list:", poll);
            return null;
          }
          return (
            <div key={poll._id} className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0 break-all">{poll.question}</div>
              <Link
                to={`/polls/${poll._id}`}
                className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition-colors duration-200 self-start sm:self-center"
              >
                View & Vote
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Polls;