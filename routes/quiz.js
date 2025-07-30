const express = require('express');
const { auth } = require('../middleware/auth');
const { 
  getQuiz, 
  submitQuizAttempt, 
  getQuizAttempts 
} = require('../controllers/quizController');

const router = express.Router();

router.get('/:id', auth, getQuiz);
router.post('/:id/attempt', auth, submitQuizAttempt);
router.get('/:id/attempts', auth, getQuizAttempts);

module.exports = router;