const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { validateCourse } = require('../middleware/validation');
const { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  enrollInCourse 
} = require('../controllers/courseController');

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', auth, adminAuth, validateCourse, createCourse);
router.post('/:id/enroll', auth, enrollInCourse);

module.exports = router;