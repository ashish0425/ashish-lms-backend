const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ isActive: true })
      .select('title description instructorName price lessons quizzes')
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments({ isActive: true });

    res.json({
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        instructorName: course.instructorName,
        price: course.price,
        lessonsCount: course.lessons.length,
        quizzesCount: course.quizzes.length
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      id: course._id,
      title: course.title,
      description: course.description,
      instructorName: course.instructorName,
      price: course.price,
      lessons: course.lessons,
      quizzes: course.quizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.questions.length
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, instructorName, price } = req.body;

    const course = await Course.create({
      title,
      description,
      instructorName,
      price
    });

    res.status(201).json({
      message: 'Course created successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        instructorName: course.instructorName,
        price: course.price
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      userId,
      courseId
    });

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment: {
        id: enrollment._id,
        courseId: enrollment.courseId,
        userId: enrollment.userId,
        enrolledAt: enrollment.enrolledAt,
        progressPercentage: enrollment.progressPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, enrollInCourse };