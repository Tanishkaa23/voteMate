// UserDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import CreatePollForm from '../Components/CreatePollForm'; // Import the new component
import PollListItem from '../Components/PollListItem';   // Import the new component
import '../index.css'; // Make sure this path is correct
import { FiPlusCircle, FiList, FiCheckSquare, FiLoader, FiAlertCircle } from 'react-icons/fi';

export default function UserDashboard() {
  const [myPolls, setMyPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loadingMyPolls, setLoadingMyPolls] = useState(true);
  const [loadingVotedPolls, setLoadingVotedPolls] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPolls();
    fetchVotedPolls();
  }, []);

  const fetchMyPolls = async () => {
    setLoadingMyPolls(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:3000/api/my-polls', { withCredentials: true });
      setMyPolls(res.data.polls || []);
    } catch (err) {
      console.error("Error fetching my polls:", err);
      setError(err.response?.data?.error || 'Failed to fetch your created polls.');
      setMyPolls([]);
    } finally {
      setLoadingMyPolls(false);
    }
  };

  const fetchVotedPolls = async () => {
    setLoadingVotedPolls(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:3000/api/voted-polls', { withCredentials: true });
      // Add a flag to voted polls if the current user is also the creator
      const processedVotedPolls = (res.data.polls || []).map(vp => ({
        ...vp,
        isUserCreator: myPolls.some(mp => mp._id === vp._id) // Check against already fetched myPolls
      }));
      setVotedPolls(processedVotedPolls);
    } catch (err) {
      console.error("Error fetching voted polls:", err);
      setError(err.response?.data?.error || 'Failed to fetch polls you voted on.');
      setVotedPolls([]);
    } finally {
      setLoadingVotedPolls(false);
    }
  };
  
  useEffect(() => {
    if (!loadingMyPolls && myPolls.length > 0) { 
        fetchVotedPolls();
    }
  }, [myPolls]); 


  const handleCreatePollSubmit = async (pollData) => {
    setError('');
    try {
      await axios.post('http://localhost:3000/api/create-poll', pollData, { withCredentials: true });
      setShowCreate(false);
      fetchMyPolls();
    } catch (err) {
      console.error("Error creating poll:", err);
      setError(err.response?.data?.error || err.response?.data?.details?.[Object.keys(err.response.data.details)[0]]?.message || 'Failed to create poll.');
    }
  };

  const handleDeletePoll = async (pollId) => {
    setError('');
    if (!window.confirm("Are you sure you want to delete this poll? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:3000/api/delete-poll/${pollId}`, { withCredentials: true });
      fetchMyPolls();
    } catch (err) {
      console.error("Error deleting poll:", err);
      setError(err.response?.data?.message || 'Failed to delete poll.');
    }
  };

  const LoadingPlaceholder = ({ count = 3 }) => (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg bg-slate-50 shadow animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="p-6 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
        <Icon className="mx-auto h-12 w-12 text-slate-400 mb-3" />
        <h3 className="text-lg font-medium text-slate-700">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );


  return (
    <div className="bg-slate-100 min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700">My Polls Dashboard</h1>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm flex items-center">
            <FiAlertCircle className="mr-2 h-5 w-5"/> {error}
          </div>
        )}

        {!showCreate && (
          <div className="mb-8 text-center sm:text-left">
            <button
              onClick={() => { setShowCreate(true); setError(''); }}
              className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition transform hover:scale-105 flex items-center justify-center sm:inline-flex mx-auto sm:mx-0"
            >
              <FiPlusCircle className="mr-2" /> Create New Poll
            </button>
          </div>
        )}

        {showCreate && (
          <CreatePollForm
            onCreatePoll={handleCreatePollSubmit}
            onCancel={() => { setShowCreate(false); setError(''); }}
          />
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-5 text-slate-800 flex items-center">
            <FiList className="mr-3 text-sky-600" /> Polls You Created
          </h2>
          {loadingMyPolls ? (
            <LoadingPlaceholder />
          ) : myPolls.length === 0 ? (
            <EmptyState icon={FiList} title="No Polls Created Yet" message="Time to share your first question with the world!" />
          ) : (
            <ul className="space-y-6">
              {myPolls.map((poll) => (
                <PollListItem
                  key={poll._id}
                  poll={poll}
                  type="created"
                  onDeletePoll={handleDeletePoll}
                />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-5 text-slate-800 flex items-center">
            <FiCheckSquare className="mr-3 text-teal-600" /> Polls You Voted On
          </h2>
          {loadingVotedPolls ? (
            <LoadingPlaceholder />
          ) : votedPolls.length === 0 ? (
            <EmptyState icon={FiCheckSquare} title="No Votes Cast Yet" message="Explore active polls and make your voice heard!" />
          ) : (
            <ul className="space-y-6">
              {votedPolls.map((poll) => (
                <PollListItem
                  key={poll._id}
                  poll={poll}
                  type="voted"
                  onDeletePoll={poll.isUserCreator ? handleDeletePoll : null} 
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}