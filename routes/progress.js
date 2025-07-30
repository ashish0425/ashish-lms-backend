const express = require('express');
const { auth } = require('../middleware/auth');
const { 
  markLessonComplete, 
  getUserProgress, 
  getCourseProgress 
} = require('../controllers/progressController');

const router = express.Router();

router.post('/lessons/:id/complete', auth, markLessonComplete);
router.get('/users/progress', auth, getUserProgress);
router.get('/courses/:id/progress', auth, getCourseProgress);

module.exports = router;