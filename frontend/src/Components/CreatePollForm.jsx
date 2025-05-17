// CreatePollForm.jsx
import React, { useState } from 'react';
import { FiPlus, FiX, FiSend, FiSlash } from 'react-icons/fi'; // Example icons

const CreatePollForm = ({ onCreatePoll, onCancel, initialQuestion = '', initialOptions = ['', '', ''] }) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [options, setOptions] = useState(initialOptions);
  const [formError, setFormError] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    if (formError) setFormError(''); // Clear error on input change
  };

  const addOptionField = () => {
    if (options.length < 10) { // Max 10 options
      setOptions([...options, '']);
    }
  };

  const removeOptionField = (index) => {
    if (options.length > 2) { // Min 2 options
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const filteredOptions = options.map(opt => opt.trim()).filter(opt => opt !== '');
    if (!question.trim()) {
        setFormError("Poll question cannot be empty.");
        return;
    }
    if (filteredOptions.length < 2) {
      setFormError("A poll must have at least two non-empty options.");
      return;
    }
    if (options.some(opt => opt.trim() === '')) {
        setFormError("All provided option fields must be filled.");
        return;
    }
    onCreatePoll({ question, options: filteredOptions });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-lg">
      <h3 className="text-2xl font-semibold mb-6 text-sky-700">Create New Poll</h3>
      {formError && <p className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">{formError}</p>}
      
      <div className="mb-5">
        <label htmlFor="poll-question" className="block text-sm font-medium text-gray-700 mb-1">
          Poll Question
        </label>
        <input
          id="poll-question"
          value={question}
          onChange={e => { setQuestion(e.target.value); if (formError) setFormError(''); }}
          placeholder="e.g., What's your favorite season?"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
          required
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Options (min. 2, max. 10)</label>
        <div className="space-y-3">
            {options.map((opt, i) => (
            <div key={i} className="flex items-center space-x-2">
                <input
                value={opt}
                onChange={e => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                required={i < 2} // Only first two options are strictly required to show the form
                />
                {options.length > 2 && (
                <button 
                    type="button" 
                    onClick={() => removeOptionField(i)} 
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                    aria-label="Remove option"
                >
                    <FiX size={20} />
                </button>
                )}
            </div>
            ))}
        </div>
         {options.length < 10 && (
            <button 
                type="button" 
                onClick={addOptionField} 
                className="mt-3 flex items-center text-sm text-sky-600 hover:text-sky-800 font-medium transition-colors"
            >
                <FiPlus className="mr-1" /> Add Option
            </button>
        )}
      </div>
      

      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-200 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center bg-slate-200 text-slate-700 font-medium rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50 transition"
        >
          <FiSlash className="mr-2" /> Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center bg-teal-500 text-white font-medium rounded-lg shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition"
        >
          <FiSend className="mr-2" /> Submit Poll
        </button>
      </div>
    </form>
  );
};

export default CreatePollForm;