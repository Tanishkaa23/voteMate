// src/Pages/UserDashboard.jsx
import { useEffect, useState } from 'react';
// import axios from 'axios'; // Remove direct axios import
import apiClient from '../services/apiClient'; // <<--- IMPORT apiClient (adjust path if needed)
import CreatePollForm from '../Components/CreatePollForm';
import PollListItem from '../Components/PollListItem';
import '../index.css';
import { FiPlusCircle, FiList, FiCheckSquare, FiAlertCircle } from 'react-icons/fi'; // Removed FiLoader as it's part of LoadingPlaceholder now

export default function UserDashboard() {
  const [myPolls, setMyPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loadingMyPolls, setLoadingMyPolls] = useState(true);
  const [loadingVotedPolls, setLoadingVotedPolls] = useState(true);
  const [error, setError] = useState('');

  // Moved fetchVotedPolls declaration up to be available for the dependency array logic
  const fetchVotedPolls = async (currentMyPolls) => { // Pass currentMyPolls to avoid stale closure
    setLoadingVotedPolls(true);
    setError(''); // Clear previous errors specific to this fetch
    try {
      const res = await apiClient.get('/api/voted-polls'); // Use apiClient
      const pollsFromApi = res.data.polls || [];
      
      // Ensure currentMyPolls is an array before using .some()
      const localMyPolls = Array.isArray(currentMyPolls) ? currentMyPolls : myPolls;

      const processedVotedPolls = pollsFromApi.map(vp => ({
        ...vp,
        isUserCreator: localMyPolls.some(mp => mp._id === vp._id)
      }));
      setVotedPolls(processedVotedPolls);
    } catch (err) {
      console.error("Error fetching voted polls:", err);
      setError(err.response?.data?.error || 'Failed to fetch polls you voted on.');
      setVotedPolls([]); // Clear voted polls on error
    } finally {
      setLoadingVotedPolls(false);
    }
  };

  const fetchMyPolls = async () => {
    setLoadingMyPolls(true);
    setError(''); // Clear previous errors specific to this fetch
    try {
      const res = await apiClient.get('/api/my-polls'); // Use apiClient
      const fetchedMyPolls = res.data.polls || [];
      setMyPolls(fetchedMyPolls);
      // After myPolls are fetched, fetch votedPolls to correctly set isUserCreator
      // Pass the freshly fetched myPolls to avoid using stale state
      if (fetchedMyPolls.length > 0) {
         await fetchVotedPolls(fetchedMyPolls); // Await if fetchVotedPolls is async and you want to ensure order
      } else {
         await fetchVotedPolls([]); // Call with empty array if no polls created by user
      }

    } catch (err) {
      console.error("Error fetching my polls:", err);
      setError(err.response?.data?.error || 'Failed to fetch your created polls.');
      setMyPolls([]); // Clear my polls on error
      setLoadingVotedPolls(false); // Also stop voted polls loading if myPolls fails
    } finally {
      setLoadingMyPolls(false);
    }
  };

  useEffect(() => {
    fetchMyPolls();
    // Initial fetchVotedPolls is now triggered by fetchMyPolls completion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // This useEffect for re-fetching votedPolls when myPolls changes is a bit tricky.
  // It can lead to extra calls. The logic in fetchMyPolls to call fetchVotedPolls after
  // myPolls are successfully fetched is generally better.
  // Keeping it might be okay if poll creation/deletion also needs to update this.
  // For now, the call within fetchMyPolls should handle the initial load correctly.
  // useEffect(() => {
  //   // Only refetch if myPolls has actually been loaded and potentially changed
  //   if (!loadingMyPolls) { 
  //       fetchVotedPolls(myPolls); // Pass current myPolls
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [myPolls, loadingMyPolls]); // Depend on myPolls and its loading state


  const handleCreatePollSubmit = async (pollData) => {
    setError('');
    try {
      await apiClient.post('/api/create-poll', pollData); // Use apiClient
      setShowCreate(false);
      fetchMyPolls(); // This will also trigger fetchVotedPolls due to the logic inside fetchMyPolls
    } catch (err) {
      console.error("Error creating poll:", err);
      setError(err.response?.data?.error || err.response?.data?.details?.[Object.keys(err.response.data.details)[0]]?.message || 'Failed to create poll.');
    }
  };

  const handleDeletePoll = async (pollId) => {
    setError('');
    if (!window.confirm("Are you sure you want to delete this poll? This action cannot be undone.")) return;
    try {
      await apiClient.delete(`/api/delete-poll/${pollId}`); // Use apiClient
      fetchMyPolls(); // This will also trigger fetchVotedPolls
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
          {/* TODO: Add personalized greeting here if currentUser is available via props/context */}
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700">My Polls Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your polls and see your voting activity.</p>
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