// PollListItem.jsx
import React from 'react';
import { FiTrash2, FiBarChart2, FiCheckCircle, FiEdit3, FiEye } from 'react-icons/fi'; // Example icons

const PollListItem = ({ poll, type, onDeletePoll }) => {
  // type can be 'created' or 'voted'
  const totalVotes = poll.votes?.reduce((sum, v) => sum + (v || 0), 0) || 0;

  return (
    <li className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="p-5">
        <p className="font-semibold text-lg text-sky-800 mb-3">{poll.question}</p>
        <ul className="space-y-2 text-sm mb-3">
          {poll.options.map((opt, i) => {
            const voteCount = poll.votes && poll.votes[i] !== undefined ? poll.votes[i] : 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            const isUserVotedOption = type === 'voted' && poll.votedOptionIndex === i;

            return (
              <li key={i} className={`flex justify-between items-center p-2 rounded-md ${isUserVotedOption ? 'bg-teal-50 text-teal-700 font-medium' : 'bg-slate-50 text-gray-600'}`}>
                <span className="flex items-center">
                  {isUserVotedOption && <FiCheckCircle className="mr-2 text-teal-500" />}
                  {opt}
                </span>
                <span className="text-xs">
                  {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)
                </span>
              </li>
            );
          })}
        </ul>
        <div className="text-xs text-gray-500 pt-2 border-t border-slate-200 flex flex-wrap justify-between items-center">
          <span>
            Created: {new Date(poll.createdAt || poll.updatedAt).toLocaleDateString()} {/* Fallback to updatedAt if createdAt missing */}
            {type === 'created' && poll.createdBy?.username && ` by You`}
            {type === 'voted' && poll.createdBy?.username && ` by ${poll.createdBy.username}`}
          </span>
          <span className="flex items-center">
            <FiBarChart2 className="mr-1"/> Total: {totalVotes} votes
          </span>
        </div>
      </div>

      {/* Actions - only for 'created' polls for now, or if it's a poll the user created listed under 'voted' */}
      {(type === 'created' || (type === 'voted' && poll.isUserCreator)) && onDeletePoll && (
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end space-x-2">
            {/* Placeholder for future edit/view actions */}
            {/* <button className="p-2 text-sky-600 hover:bg-sky-100 rounded-full" title="View Details">
                <FiEye size={16} />
            </button>
            <button className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full" title="Edit Poll">
                <FiEdit3 size={16} />
            </button> */}
            <button
                onClick={() => onDeletePoll(poll._id)}
                className="flex items-center px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition font-medium"
                title="Delete Poll"
            >
                <FiTrash2 className="mr-1" /> Delete
            </button>
        </div>
      )}
    </li>
  );
};

export default PollListItem;