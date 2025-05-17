const express = require('express');
const pollController = require('../controllers/poll.controller');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth.middleware'); 

router.post('/create-poll', authMiddleware, pollController.createPoll);
router.get('/polls', pollController.getAllPolls); 
router.get('/poll/:id', authMiddleware, pollController.viewPollController);
router.post('/poll/:id/vote', authMiddleware, pollController.votePollController);
router.get('/my-polls', authMiddleware, pollController.getMyPolls);
router.get('/voted-polls', authMiddleware, pollController.getVotedPolls);
router.delete('/delete-poll/:id', authMiddleware, pollController.deletePollController);

module.exports = router;