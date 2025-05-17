const pollModel = require("../models/poll.model");

// CREATE POLL
module.exports.createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    if (!question || !options || !Array.isArray(options) || options.some(opt => typeof opt !== 'string' || opt.trim() === '')) {
      return res
        .status(400)
        .json({ error: "Question and valid, non-empty options are required" });
    }
    if (options.length < 2) {
        return res.status(400).json({ error: "A poll must have at least two options." });
    }

    const poll = await pollModel.create({
      question,
      options,
      votes: Array(options.length).fill(0), // Initialize vote counts for each option
      createdBy: req.user.id,
      voters: [] // Initialize as an empty array
    });

    res.status(201).json({ message: "Poll created successfully", poll });
  } catch (err) {
    console.error("Error creating poll:", err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    res.status(500).json({ error: "Failed to create poll", details: err.message });
  }
};

// GET ALL POLLS
module.exports.getAllPolls = async (req, res) => {
  try {
    const polls = await pollModel.find()
                                 .populate('createdBy', 'username') // Populate creator's username
                                 .sort({ createdAt: -1 }); // Sort by newest
    return res.status(200).json({ message: "All polls fetched successfully", polls });
  } catch (err) {
    console.error("Error in getAllPolls:", err);
    res.status(500).json({ error: "Failed to fetch all polls", details: err.message });
  }
};

// VIEW A SINGLE POLL
module.exports.viewPollController = async (req, res) => {
  try {
    const poll = await pollModel.findById(req.params.id)
                                .populate('createdBy', 'username');
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    res.status(200).json(poll);
  } catch (err) {
    console.error("Error in viewPollController:", err);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid poll ID format" });
    }
    res.status(500).json({ error: "Failed to fetch poll", details: err.message });
  }
};

// VOTE ON A POLL
module.exports.votePollController = async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body; // optionIndex is the index of the option chosen
    const userId = req.user.id;

    if (optionIndex === undefined || typeof optionIndex !== 'number') {
      return res.status(400).json({ message: "optionIndex is required and must be a number" });
    }

    const poll = await pollModel.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option selected" });
    }

    // Check if user has already voted
    const existingVote = poll.voters.find(voter => voter.userId.toString() === userId.toString());
    if (existingVote) {
      return res.status(400).json({ message: "You've already voted on this poll" });
    }

    // Increment vote count for the chosen option
    // Ensure votes array is correctly sized (should be by createPoll)
    if (!poll.votes || poll.votes.length !== poll.options.length) {
        poll.votes = Array(poll.options.length).fill(0); // Safeguard
    }
    poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1;
    // Mark the option as voted by Mongoose for atomicity if possible, or ensure save reflects this
    poll.markModified(`votes.${optionIndex}`);


    // Add voter information (userId and their chosen optionIndex)
    poll.voters.push({ userId: userId, optionIndex: optionIndex });

    await poll.save();
    
    // Fetch the updated poll to return with populated createdBy if needed,
    // or just send a success message. For consistency, let's send the updated poll.
    const updatedPoll = await pollModel.findById(pollId).populate('createdBy', 'username');

    res.status(200).json({ message: "Voted successfully on this poll", poll: updatedPoll });
  } catch (error) {
    console.error("Server error in votePollController:", error);
    res.status(500).json({ message: "Server error while voting", error: error.message });
  }
};

// GET POLLS CREATED BY THE CURRENT USER
// poll.controller.js

// ... other controllers ...

module.exports.getMyPolls = async (req, res) => {
  try {
    // req.user.id authMiddleware se aana chahiye
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "User not authenticated to fetch their polls." });
    }
    
    const userId = req.user.id; // Logged in user's ID

    const myPolls = await pollModel.find({ createdBy: userId }) // <<--- YEH LINE IMPORTANT HAI
                                   .populate('createdBy', 'username') // Optional: if you still want creator info (it will be 'You')
                                   .sort({ createdAt: -1 });

    res.status(200).json({ message: "Your created polls fetched successfully", polls: myPolls });
  } catch (err) {
    console.error("Error in getMyPolls:", err);
    res.status(500).json({ error: "Failed to fetch your polls", details: err.message });
  }
};
// GET POLLS THE CURRENT USER HAS VOTED ON
module.exports.getVotedPolls = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find polls where the 'voters' array contains an element with 'userId' matching the current user's ID
    const pollsVotedByUser = await pollModel.find({ 'voters.userId': userId })
                                           .populate('createdBy', 'username') // Optional: if you need creator info
                                           .sort({ updatedAt: -1 }); // Sort by when they were last updated (e.g., voted on)

    if (!pollsVotedByUser || pollsVotedByUser.length === 0) {
      return res.status(200).json({ message: 'You have not voted on any polls yet.', polls: [] });
    }

    const formattedVotedPolls = pollsVotedByUser.map(poll => {
      // Find the specific vote entry for this user in this poll
      const userVote = poll.voters.find(voter => voter.userId.toString() === userId.toString());

      // This should always be found due to the MongoDB query, but as a safeguard:
      if (!userVote) {
        console.warn(`User vote details not found in poll ${poll._id} for user ${userId} despite query.`);
        return null; // Or handle as an error / skip this poll
      }
      
      return {
        _id: poll._id,
        question: poll.question,
        options: poll.options,
        votes: poll.votes, // Full vote counts for all options
        createdBy: poll.createdBy, // Creator info
        // Add the index of the option the current user voted for
        votedOptionIndex: userVote ? userVote.optionIndex : -1, // -1 if somehow not found
      };
    }).filter(Boolean); // Remove any nulls if added

    res.status(200).json({ message: 'Polls you voted on fetched successfully', polls: formattedVotedPolls });
  } catch (err) {
    console.error("Error in getVotedPolls:", err);
    res.status(500).json({ error: 'Failed to fetch voted polls', details: err.message });
  }
};

// DELETE A POLL (Assuming only creator can delete)
module.exports.deletePollController = async (req, res) => {
  try {
    const pollId = req.params.id; // Assuming route is /api/delete-poll/:id
    const userId = req.user.id;

    const poll = await pollModel.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only delete polls you created." });
    }

    await pollModel.findByIdAndDelete(pollId);
    // Or if you use Mongoose pre/post remove hooks: await poll.remove();

    res.status(200).json({ message: "Poll deleted successfully", pollId: pollId });
  } catch (error) {
    console.error("Error in deletePollController:", error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid poll ID format" });
    }
    res.status(500).json({ message: "Server error while deleting poll", error: error.message });
  }
};