// ../models/poll.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollSchema = new Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: [{ // Array of strings for each option text
        type: String,
        required: true,
        trim: true
    }],
    votes: [{ // Parallel array to options, storing vote count for each option
        type: Number,
        required: true,
        default: 0
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
    },
    voters: [{ // Array to track who voted and for which option
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        optionIndex: { // The index of the option in the 'options' array
            type: Number,
            required: true
        }
    }]
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Poll', pollSchema);